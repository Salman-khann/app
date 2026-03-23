import { supabase } from './supabase';
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

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  return true;
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
  return { products: data || [], total: count || 0 };
}

export async function getProduct(productId: string) {
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
  const { data, error } = await supabase
    .from('consultations')
    .insert(consultation)
    .select()
    .single();

  if (error) {
    console.error('Error creating consultation:', error);
    return null;
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
    return [];
  }
  return data || [];
}

export async function addToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
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
      console.error('Error updating cart item:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity });

    if (error) {
      console.error('Error adding to cart:', error);
      return false;
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

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) {
    console.error('Error updating cart item:', error);
    return false;
  }
  return true;
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing from cart:', error);
    return false;
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
