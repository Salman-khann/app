import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type {
  Profile,
  DermatologistProfile,
  SkinAnalysis,
  SkincareRoutine,
  Product,
  ProductRecommendation,
  Consultation,
  Prescription,
} from '@/types';

const MOCK_DOCTORS: Record<string, any> = {
  'mock-doctor-1': {
    id: 'mock-doctor-1',
    specialization: 'Clinical Dermatology',
    years_experience: 12,
    languages: ['English', 'Arabic'],
    consultation_fee: 350,
    clinic_emirate: 'Dubai',
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71f153678f?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Sarah Ahmed',
    }
  },
  'mock-doctor-2': {
    id: 'mock-doctor-2',
    specialization: 'Cosmetic Dermatology',
    years_experience: 8,
    languages: ['English', 'French'],
    consultation_fee: 450,
    clinic_emirate: 'Abu Dhabi',
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Marcus Chen',
    }
  },
  'mock-doctor-3': {
    id: 'mock-doctor-3',
    specialization: 'Pediatric Dermatology',
    years_experience: 15,
    languages: ['English', 'Spanish'],
    consultation_fee: 400,
    clinic_emirate: 'Dubai',
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Elena Rodriguez',
    }
  },
  'mock-doctor-4': {
    id: 'mock-doctor-4',
    specialization: 'Dermatopathology',
    years_experience: 20,
    languages: ['English'],
    consultation_fee: 500,
    clinic_emirate: 'Sharjah',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. James Wilson',
    }
  },
  'mock-doctor-5': {
    id: 'mock-doctor-5',
    specialization: 'Surgical Dermatology',
    years_experience: 10,
    languages: ['Arabic', 'English'],
    consultation_fee: 600,
    clinic_emirate: 'Abu Dhabi',
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Fatima Al Hashimi',
    }
  },
  'mock-doctor-6': {
    id: 'mock-doctor-6',
    specialization: 'Laser & Aesthetics',
    years_experience: 7,
    languages: ['English', 'Korean'],
    consultation_fee: 550,
    clinic_emirate: 'Dubai',
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Robert Kim',
    }
  },
  'mock-doctor-7': {
    id: 'mock-doctor-7',
    specialization: 'General Dermatology',
    years_experience: 14,
    languages: ['English', 'Urdu', 'Hindi'],
    consultation_fee: 300,
    clinic_emirate: 'Ajman',
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71f153678f?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Aisha Malik',
    }
  },
  'mock-doctor-8': {
    id: 'mock-doctor-8',
    specialization: 'Immunodermatology',
    years_experience: 18,
    languages: ['English', 'German'],
    consultation_fee: 480,
    clinic_emirate: 'Dubai',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. David Miller',
    }
  },
  'mock-doctor-9': {
    id: 'mock-doctor-9',
    specialization: 'Trichology',
    years_experience: 9,
    languages: ['Arabic', 'English'],
    consultation_fee: 380,
    clinic_emirate: 'Ras Al Khaimah',
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Noor Al Mansoori',
    }
  },
  'mock-doctor-10': {
    id: 'mock-doctor-10',
    specialization: 'Photodermatology',
    years_experience: 11,
    languages: ['English'],
    consultation_fee: 420,
    clinic_emirate: 'Fujairah',
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    verification_status: 'approved',
    profile: {
      full_name: 'Dr. Thomas Brown',
    }
  }
};

export async function ensureProfileForUser(user: User): Promise<Profile | null> {
  const role = (user.user_metadata?.role as Profile['role'] | undefined) ?? 'user';
  const profilePayload = {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error ensuring profile:', error);
    return null;
  }

  return data;
}

// Profile operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ success: boolean; errorMessage?: string }> {
  const existingProfile = await getProfile(userId);

  if (!existingProfile) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email: null,
      phone: null,
      role: 'user',
      full_name: updates.full_name ?? null,
      age: updates.age ?? null,
      gender: updates.gender ?? null,
      location: updates.location ?? null,
      known_allergies: updates.known_allergies ?? null,
      current_medications: updates.current_medications ?? null,
    });

    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, errorMessage: error.message };
    }

    return { success: true };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      role: existingProfile.role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, errorMessage: error.message };
  }
  return { success: true };
}

export async function getAllUsers(limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }
  return { users: data || [], total: count || 0 };
}

// Dermatologist operations
export async function getDermatologistProfile(userId: string) {
  // Check for mock IDs first
  if (userId.startsWith('mock-doctor-')) {
    return MOCK_DOCTORS[userId] || null;
  }

  const { data, error } = await supabase
    .from('dermatologist_profiles')
    .select('*, profile:profiles(*)')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching dermatologist profile:', error);
    return null;
  }
  
  return data;
}

export async function getApprovedDermatologists(filters?: {
  emirate?: string;
  language?: string;
}) {
  let query = supabase
    .from('dermatologist_profiles')
    .select('*, profile:profiles(*)')
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false });

  if (filters?.emirate) {
    query = query.eq('clinic_emirate', filters.emirate);
  }

  if (filters?.language) {
    query = query.contains('languages', [filters.language]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching dermatologists:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    // Return mock data for demo purposes if DB is empty
    let mockData = Object.values(MOCK_DOCTORS);

    if (filters?.emirate) {
      mockData = mockData.filter((d) => d.clinic_emirate === filters.emirate);
    }

    if (filters?.language) {
      mockData = mockData.filter((d) => d.languages?.includes(filters.language));
    }

    return mockData;
  }
  
  return data || [];
}

export async function getAllDermatologists() {
  const { data, error } = await supabase
    .from('dermatologist_profiles')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all dermatologists:', error);
    return [];
  }
  return data || [];
}

export async function updateDermatologistProfile(
  userId: string,
  updates: Partial<DermatologistProfile>
): Promise<boolean> {
  const { error } = await supabase
    .from('dermatologist_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating dermatologist profile:', error);
    return false;
  }
  return true;
}

export async function createDermatologistProfile(
  userId: string,
  data: Partial<DermatologistProfile>
): Promise<boolean> {
  const { error } = await supabase
    .from('dermatologist_profiles')
    .insert({ id: userId, ...data });

  if (error) {
    console.error('Error creating dermatologist profile:', error);
    return false;
  }
  return true;
}

// Skin analysis operations
export async function createSkinAnalysis(
  userId: string,
  data: Partial<SkinAnalysis>
): Promise<string | null> {
  const { data: analysis, error } = await supabase
    .from('skin_analyses')
    .insert({ user_id: userId, ...data })
    .select()
    .single();

  if (error) {
    console.error('Error creating skin analysis:', error);
    return null;
  }
  return analysis.id;
}

export async function getSkinAnalyses(userId: string) {
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching skin analyses:', error);
    return [];
  }
  return data || [];
}

export async function getSkinAnalysis(analysisId: string) {
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('id', analysisId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching skin analysis:', error);
    return null;
  }
  return data;
}

// Skincare routine operations
export async function getActiveRoutine(userId: string) {
  const { data, error } = await supabase
    .from('skincare_routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching routine:', error);
    return null;
  }
  return data;
}

export async function getRoutineByAnalysis(analysisId: string) {
  const { data, error } = await supabase
    .from('skincare_routines')
    .select('*')
    .eq('analysis_id', analysisId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching routine by analysis:', error);
    return null;
  }
  return data;
}

export async function createSkincareRoutine(
  userId: string,
  analysisId: string,
  routine: Partial<SkincareRoutine>
): Promise<boolean> {
  const { error } = await supabase
    .from('skincare_routines')
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      ...routine,
    });

  if (error) {
    console.error('Error creating routine:', error);
    return false;
  }
  return true;
}


// Product operations
export async function getProducts(filters?: {
  category?: string;
  skinType?: string;
  concern?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}, limit = 20, offset = 0) {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .gt('stock_quantity', 0);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.skinType) {
    query = query.contains('suitable_skin_types', [filters.skinType]);
  }

  if (filters?.concern) {
    query = query.contains('target_concerns', [filters.concern]);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price_aed', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price_aed', filters.maxPrice);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  if (!data || data.length === 0) {
    const mockProducts = [
      {
        id: 'mock-prod-1',
        name: 'Gentle Hydrating Cleanser',
        brand: 'DermAl Care',
        description: 'A gentle, non-foaming cleanser that removes impurities without stripping the skin.',
        price_aed: 85,
        category: 'Cleanser',
        suitable_skin_types: ['dry', 'sensitive', 'normal'],
        stock_quantity: 100,
        image_urls: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop'],
        rating: 4.8
      },
      {
        id: 'mock-prod-2',
        name: 'SPF 50+ Sun Defense',
        brand: 'DermAl Care',
        description: 'Broad-spectrum protection tailored for the intense UAE sun. Water-resistant and oil-free.',
        price_aed: 120,
        category: 'Sunscreen',
        suitable_skin_types: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        stock_quantity: 50,
        image_urls: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop'],
        rating: 4.9
      },
      {
        id: 'mock-prod-3',
        name: 'Advanced Retinol Serum',
        brand: 'ProSkin',
        description: 'Night treatment to reduce fine lines and improve skin texture.',
        price_aed: 210,
        category: 'Treatment',
        suitable_skin_types: ['normal', 'combination', 'oily'],
        stock_quantity: 30,
        image_urls: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop'],
        rating: 4.7
      }
    ];
    return { products: mockProducts as any[], total: 3 };
  }

  return { products: data || [], total: count || 0 };
}

export async function getProduct(productId: string) {
  // Check for mock IDs first
  if (productId.startsWith('mock-prod-')) {
    const mockProducts: Record<string, any> = {
      'mock-prod-1': {
        id: 'mock-prod-1',
        name: 'Gentle Hydrating Cleanser',
        brand: 'DermAl Care',
        description: 'A gentle, non-foaming cleanser that removes impurities without stripping the skin.',
        price_aed: 85,
        category: 'Cleanser',
        suitable_skin_types: ['dry', 'sensitive', 'normal'],
        stock_quantity: 100,
        image_urls: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop'],
        rating: 4.8
      },
      'mock-prod-2': {
        id: 'mock-prod-2',
        name: 'SPF 50+ Sun Defense',
        brand: 'DermAl Care',
        description: 'Broad-spectrum protection tailored for the intense UAE sun. Water-resistant and oil-free.',
        price_aed: 120,
        category: 'Sunscreen',
        suitable_skin_types: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        stock_quantity: 50,
        image_urls: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop'],
        rating: 4.9
      },
      'mock-prod-3': {
        id: 'mock-prod-3',
        name: 'Advanced Retinol Serum',
        brand: 'ProSkin',
        description: 'Night treatment to reduce fine lines and improve skin texture.',
        price_aed: 210,
        category: 'Treatment',
        suitable_skin_types: ['normal', 'combination', 'oily'],
        stock_quantity: 30,
        image_urls: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop'],
        rating: 4.7
      }
    };
    return mockProducts[productId] || null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
  return data || [];
}

// Product recommendations
export async function getProductRecommendations(userId: string, analysisId: string) {
  const { data, error } = await supabase
    .from('product_recommendations')
    .select('*, product:products(*)')
    .eq('user_id', userId)
    .eq('analysis_id', analysisId)
    .order('suitability_score', { ascending: false });

  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
  return data || [];
}

// Consultation operations
export async function createConsultation(consultation: Partial<Consultation>): Promise<string | null> {
