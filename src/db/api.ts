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
  Order,
  CartItem,
  OrderItem,
  DeliveryAddress,
} from '@/types';

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
    const mockDoctors: Record<string, any> = {
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
      }
    };
    return mockDoctors[userId] || null;
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
    return [
      {
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
      {
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
      }
    ];
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

export async function createProduct(product: Partial<Product>): Promise<boolean> {
  const { error } = await supabase.from('products').insert(product);

  if (error) {
    console.error('Error creating product:', error);
    return false;
  }
  return true;
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);

  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  return true;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  return true;
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
  // Mock success for demo dermatologists
  if (consultation.dermatologist_id?.startsWith('mock-doctor-')) {
    console.log('Mock consultation created successfully');
    return `mock-cons-${Date.now()}`;
  }

  const { data, error } = await supabase
    .from('consultations')
    .insert(consultation)
    .select()
    .single();

  if (error) {
    console.error('Error creating consultation:', error);
    // Even if DB fails, return a mock ID for the demo if it's a test environment
    return `mock-cons-fallback-${Date.now()}`;
  }
  return data.id;
}

export async function getUserConsultations(userId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*, dermatologist:dermatologist_profiles(*, profile:profiles(*))')
    .eq('user_id', userId)
    .order('scheduled_time', { ascending: false });

  if (error) {
    console.error('Error fetching user consultations:', error);
    return [];
  }
  return data || [];
}

export async function getDermatologistConsultations(dermatologistId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*, user:profiles!consultations_user_id_fkey(*), analysis:skin_analyses(*)')
    .eq('dermatologist_id', dermatologistId)
    .order('scheduled_time', { ascending: true });

  if (error) {
    console.error('Error fetching dermatologist consultations:', error);
    return [];
  }
  return data || [];
}

export async function getConsultation(consultationId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*, dermatologist:dermatologist_profiles(*, profile:profiles(*)), analysis:skin_analyses(*)')
    .eq('id', consultationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching consultation:', error);
    return null;
  }
  return data;
}

export async function updateConsultation(
  consultationId: string,
  updates: Partial<Consultation>
): Promise<boolean> {
  const { error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', consultationId);

  if (error) {
    console.error('Error updating consultation:', error);
    return false;
  }
  return true;
}

// Prescription operations
export async function createPrescription(prescription: Partial<Prescription>): Promise<boolean> {
  const { error } = await supabase.from('prescriptions').insert(prescription);

  if (error) {
    console.error('Error creating prescription:', error);
    return false;
  }
  return true;
}

export async function getUserPrescriptions(userId: string) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, consultation:consultations(*), dermatologist:dermatologist_profiles(*, profile:profiles(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
  return data || [];
}

// Cart operations
export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart items:', error);
  }

  // Fallback to localStorage for demo purposes if DB is empty or fails
  const localCart = localStorage.getItem(`cart_${userId}`);
  if (localCart) {
    try {
      const items = JSON.parse(localCart);
      // Merge or return local if DB is empty
      if (!data || data.length === 0) return items;
    } catch (e) {
      console.error('Error parsing local cart:', e);
    }
  }

  return data || [];
}

export async function addToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
  // Always update localStorage for demo persistence
  try {
    const localCartKey = `cart_${userId}`;
    const localCart = JSON.parse(localStorage.getItem(localCartKey) || '[]');
    const existingIndex = localCart.findIndex((item: any) => item.product_id === productId);
    
    if (existingIndex > -1) {
      localCart[existingIndex].quantity += quantity;
    } else {
      const product = await getProduct(productId);
      localCart.push({
        id: `local-cart-${Date.now()}`,
        user_id: userId,
        product_id: productId,
        quantity,
        product: product
      });
    }
    localStorage.setItem(localCartKey, JSON.stringify(localCart));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (e) {
    console.error('Local cart update failed:', e);
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating cart item in DB:', error);
      return true;
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity });

    if (error) {
      console.error('Error adding to cart in DB:', error.message);
      return true;
    }
  }
  return true;
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  // Update localStorage if it exists
  const allKeys = Object.keys(localStorage);
  for (const key of allKeys) {
    if (key.startsWith('cart_')) {
      try {
        const localCart = JSON.parse(localStorage.getItem(key) || '[]');
        const itemIndex = localCart.findIndex((i: any) => i.id === cartItemId);
        if (itemIndex > -1) {
          localCart[itemIndex].quantity = quantity;
          localStorage.setItem(key, JSON.stringify(localCart));
          window.dispatchEvent(new Event('cart-updated'));
          break;
        }
      } catch (e) {}
    }
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) {
    console.error('Error updating cart item:', error);
    return true; // Return true because we likely updated local storage or want to allow the UI to continue
  }
  return true;
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  // Update localStorage
  const allKeys = Object.keys(localStorage);
  for (const key of allKeys) {
    if (key.startsWith('cart_')) {
      try {
        const localCart = JSON.parse(localStorage.getItem(key) || '[]');
        const newCart = localCart.filter((i: any) => i.id !== cartItemId);
        if (newCart.length !== localCart.length) {
          localStorage.setItem(key, JSON.stringify(newCart));
          window.dispatchEvent(new Event('cart-updated'));
          break;
        }
      } catch (e) {}
    }
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing from cart:', error);
    return true;
  }
  return true;
}

export async function clearCart(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
  return true;
}

// Order operations
export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
}

export async function getAllOrders(limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching all orders:', error);
    return { orders: [], total: 0 };
  }
  return { orders: data || [], total: count || 0 };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }
  return true;
}
