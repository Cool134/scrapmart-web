export type Role = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string | null;
  createdAt: string; // Firestore Timestamp
}

export interface AIAnalysisResult {
  material: string;
  thickness_mm: number;
  width_cm: number;
  height_cm: number;
  surface_area_cm2: number;
  estimated_weight_kg: number;
  suggested_price_inr: number;
  outline_points: number[][]; // Array of [x,y] coordinates
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
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface Order {
  id?: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string; // ISO String
}

export interface SearchFilters {
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  thickness?: number;
}
