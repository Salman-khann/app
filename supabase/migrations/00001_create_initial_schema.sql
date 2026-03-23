-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enums
create type user_role as enum ('user', 'dermatologist', 'admin');
create type skin_type as enum ('oily', 'dry', 'combination', 'sensitive', 'normal');
create type concern_severity as enum ('mild', 'moderate', 'severe');
create type consultation_type as enum ('video', 'in_clinic');
create type consultation_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type doctor_verification_status as enum ('pending', 'approved', 'rejected');

-- Profiles table (synced with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  role user_role not null default 'user'::user_role,
  full_name text,
  age integer,
  gender text,
  location text,
  known_allergies text[],
  current_medications text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dermatologist profiles
create table dermatologist_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  specialization text,
  years_experience integer,
  languages text[],
  consultation_fee numeric(10,2),
  clinic_address text,
  clinic_emirate text,
  license_number text,
  verification_status doctor_verification_status default 'pending'::doctor_verification_status,
  bio text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Skin analyses
create table skin_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  photo_url text,
  questionnaire_data jsonb,
  skin_type skin_type,
  skin_score integer check (skin_score >= 0 and skin_score <= 100),
  concerns jsonb,
  facial_map_data jsonb,
  ai_summary text,
  confidence_score numeric(3,2),
  created_at timestamptz default now()
);

-- Skincare routines
create table skincare_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  analysis_id uuid references skin_analyses(id) on delete set null,
  morning_routine jsonb,
  evening_routine jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  description text,
  key_ingredients text[],
  usage_instructions text,
  category text,
  suitable_skin_types skin_type[],
  target_concerns text[],
  price_aed numeric(10,2) not null,
  stock_quantity integer default 0,
  image_urls text[],
  rating numeric(2,1),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product recommendations
create table product_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  analysis_id uuid references skin_analyses(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  suitability_score integer check (suitability_score >= 0 and suitability_score <= 100),
  created_at timestamptz default now()
);

-- Consultations
create table consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  dermatologist_id uuid references dermatologist_profiles(id) on delete cascade,
  analysis_id uuid references skin_analyses(id) on delete set null,
  consultation_type consultation_type not null,
  scheduled_time timestamptz not null,
  status consultation_status default 'scheduled'::consultation_status,
  fee_aed numeric(10,2) not null,
  video_room_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prescriptions
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete cascade,
  dermatologist_id uuid references dermatologist_profiles(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  medications jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  items jsonb not null,
  subtotal_aed numeric(10,2) not null,
  vat_aed numeric(10,2) not null,
  delivery_fee_aed numeric(10,2) default 0,
  total_aed numeric(10,2) not null,
  status order_status default 'pending'::order_status,
  delivery_address jsonb,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shopping cart
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Create indexes
create index idx_skin_analyses_user_id on skin_analyses(user_id);
create index idx_skin_analyses_created_at on skin_analyses(created_at desc);
create index idx_skincare_routines_user_id on skincare_routines(user_id);
create index idx_products_category on products(category);
create index idx_consultations_user_id on consultations(user_id);
create index idx_consultations_dermatologist_id on consultations(dermatologist_id);
create index idx_consultations_scheduled_time on consultations(scheduled_time);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_stripe_session_id on orders(stripe_session_id);
create index idx_cart_items_user_id on cart_items(user_id);

-- Create storage bucket for skin analysis photos
insert into storage.buckets (id, name, public) 
values ('app-agw53ovmohdt_skin_analysis_images', 'app-agw53ovmohdt_skin_analysis_images', true);

-- Storage policies for skin analysis images
create policy "Anyone can view skin analysis images"
  on storage.objects for select
  using (bucket_id = 'app-agw53ovmohdt_skin_analysis_images');

create policy "Authenticated users can upload skin analysis images"
  on storage.objects for insert
  with check (
    bucket_id = 'app-agw53ovmohdt_skin_analysis_images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can delete their own skin analysis images"
  on storage.objects for delete
  using (
    bucket_id = 'app-agw53ovmohdt_skin_analysis_images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for product images
insert into storage.buckets (id, name, public) 
values ('app-agw53ovmohdt_product_images', 'app-agw53ovmohdt_product_images', true);

-- Storage policies for product images
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'app-agw53ovmohdt_product_images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'app-agw53ovmohdt_product_images' 
    and exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'::user_role
    )
  );

-- Helper function to check admin role
create or replace function is_admin(uid uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles p
    where p.id = uid and p.role = 'admin'::user_role
  );
$$;

-- Helper function to check dermatologist role
create or replace function is_dermatologist(uid uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles p
    where p.id = uid and p.role = 'dermatologist'::user_role
  );
$$;

-- Trigger function to sync auth.users to profiles
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from profiles;
  
  insert into public.profiles (id, email, phone, role)
  values (
    new.id,
    new.email,
    new.phone,
    case when user_count = 0 then 'admin'::user_role else 'user'::user_role end
  );
  return new;
end;
$$;

-- Trigger to sync users on confirmation
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row
  when (old.confirmed_at is null and new.confirmed_at is not null)
  execute function handle_new_user();

-- Enable RLS
alter table profiles enable row level security;
alter table dermatologist_profiles enable row level security;
alter table skin_analyses enable row level security;
alter table skincare_routines enable row level security;
alter table products enable row level security;
alter table product_recommendations enable row level security;
alter table consultations enable row level security;
alter table prescriptions enable row level security;
alter table orders enable row level security;
alter table cart_items enable row level security;

-- Profiles policies
create policy "Admins have full access to profiles"
  on profiles for all
  using (is_admin(auth.uid()));

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (role is not distinct from (select role from profiles where id = auth.uid()));

-- Dermatologist profiles policies
create policy "Anyone can view approved dermatologists"
  on dermatologist_profiles for select
  using (verification_status = 'approved'::doctor_verification_status or auth.uid() = id or is_admin(auth.uid()));

create policy "Dermatologists can update their own profile"
  on dermatologist_profiles for update
  using (auth.uid() = id);

create policy "Dermatologists can insert their own profile"
  on dermatologist_profiles for insert
  with check (auth.uid() = id and is_dermatologist(auth.uid()));

create policy "Admins can manage all dermatologist profiles"
  on dermatologist_profiles for all
  using (is_admin(auth.uid()));

-- Skin analyses policies
create policy "Users can view their own analyses"
  on skin_analyses for select
  using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Users can insert their own analyses"
  on skin_analyses for insert
  with check (auth.uid() = user_id);

create policy "Dermatologists can view analyses shared with them"
  on skin_analyses for select
  using (
    exists (
      select 1 from consultations c
      where c.analysis_id = skin_analyses.id
      and c.dermatologist_id = auth.uid()
    )
  );

-- Skincare routines policies
create policy "Users can view their own routines"
  on skincare_routines for select
  using (auth.uid() = user_id);

create policy "Users can manage their own routines"
  on skincare_routines for all
  using (auth.uid() = user_id);

-- Products policies
create policy "Anyone can view products"
  on products for select
  using (true);

create policy "Admins can manage products"
  on products for all
  using (is_admin(auth.uid()));

-- Product recommendations policies
create policy "Users can view their own recommendations"
  on product_recommendations for select
  using (auth.uid() = user_id);

create policy "System can insert recommendations"
  on product_recommendations for insert
  with check (true);

-- Consultations policies
create policy "Users can view their own consultations"
  on consultations for select
  using (auth.uid() = user_id or auth.uid() = dermatologist_id or is_admin(auth.uid()));

create policy "Users can create consultations"
  on consultations for insert
  with check (auth.uid() = user_id);

create policy "Dermatologists can update their consultations"
  on consultations for update
  using (auth.uid() = dermatologist_id);

create policy "Admins can manage all consultations"
  on consultations for all
  using (is_admin(auth.uid()));

-- Prescriptions policies
create policy "Users and dermatologists can view prescriptions"
  on prescriptions for select
  using (auth.uid() = user_id or auth.uid() = dermatologist_id or is_admin(auth.uid()));

create policy "Dermatologists can create prescriptions"
  on prescriptions for insert
  with check (auth.uid() = dermatologist_id);

-- Orders policies
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Service role can manage orders"
  on orders for all
  using (auth.jwt()->>'role' = 'service_role');

create policy "Admins can manage all orders"
  on orders for all
  using (is_admin(auth.uid()));

-- Cart items policies
create policy "Users can manage their own cart"
  on cart_items for all
  using (auth.uid() = user_id);

-- Create public view for shareable profile info
create view public_profiles as
  select id, role, full_name from profiles;