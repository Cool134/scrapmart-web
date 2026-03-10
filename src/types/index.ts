export type Role = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  material: string;
  thickness_mm: number;
  width_cm: number;
  height_cm: number;
  surface_area_cm2: number;
  estimated_weight_kg: number;
  suggested_price_usd: number;
  outline_points: number[][];
  surface_condition: string;
  confidence: number;
  description: string;
}

export interface Listing extends AIAnalysisResult {
  id?: string;
  sellerId: string;
  title: string;
  price: number;
  location: string;
  status: 'active' | 'sold' | 'draft';
  imageURL: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id?: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
}

export interface SearchFilters {
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  thickness?: number;
}
