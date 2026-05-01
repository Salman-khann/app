export type UserRole = 'user' | 'dermatologist' | 'admin';
export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
export type ConcernSeverity = 'mild' | 'moderate' | 'severe';
export type ConsultationType = 'video' | 'in_clinic';
export type ConsultationStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type DoctorVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  known_allergies: string[] | null;
  current_medications: string | null;
  created_at: string;
  updated_at: string;
}

export interface DermatologistProfile {
  id: string;
  specialization: string | null;
  years_experience: number | null;
  languages: string[] | null;
  consultation_fee: number | null;
  clinic_address: string | null;
  clinic_emirate: string | null;
  license_number: string | null;
  verification_status: DoctorVerificationStatus;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkinConcern {
  type: string;
  severity: ConcernSeverity;
  zones?: string[];
}

export interface SkinAnalysis {
  id: string;
  user_id: string;
  photo_url: string | null;
  questionnaire_data: Record<string, any> | null;
  skin_type: SkinType | null;
  skin_score: number | null;
  concerns: SkinConcern[] | null;
  facial_map_data: Record<string, any> | null;
  ai_summary: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface RoutineStep {
  step: number;
  category: string;
  product_name: string;
  instructions: string;
}

export interface SkincareRoutine {
  id: string;
  user_id: string;
  analysis_id: string | null;
  morning_routine: RoutineStep[] | null;
  evening_routine: RoutineStep[] | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  key_ingredients: string[] | null;
  usage_instructions: string | null;
  category: string | null;
  suitable_skin_types: SkinType[] | null;
  target_concerns: string[] | null;
  price_aed: number;
  stock_quantity: number;
  image_urls: string[] | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRecommendation {
  id: string;
  user_id: string;
  analysis_id: string;
  product_id: string;
  suitability_score: number | null;
  created_at: string;
  product?: Product;
}

export interface Consultation {
  id: string;
  user_id: string;
  dermatologist_id: string;
  analysis_id: string | null;
  consultation_type: ConsultationType;
  scheduled_time: string;
  status: ConsultationStatus;
  fee_aed: number;
  video_room_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  dermatologist?: DermatologistProfile & { profile?: Profile };
}

export interface Medication {
  name: string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  dermatologist_id: string;
  user_id: string;
  medications: Medication[] | null;
  notes: string | null;
  created_at: string;
}


