import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, addDoc } from 'firebase/firestore';
import { Listing, Order, SearchFilters } from '@/types';

export const createListing = async (data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ref = doc(collection(db, 'listings'));
  const now = new Date().toISOString();
  await setDoc(ref, { ...data, id: ref.id, createdAt: now, updatedAt: now });
  return ref.id;
};

export const updateListing = async (id: string, data: Partial<Listing>) => {
  const ref = doc(db, 'listings', id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteListing = async (id: string) => {
  await deleteDoc(doc(db, 'listings', id));
};

export const getListing = async (id: string) => {
  const d = await getDoc(doc(db, 'listings', id));
  return d.exists() ? (d.data() as Listing) : null;
};

export const getListings = async (filters: SearchFilters = {}) => {
  let q = query(collection(db, 'listings'), where('status', '==', 'active'));
  
  if (filters.material) q = query(q, where('material', '==', filters.material));
  if (filters.thickness) q = query(q, where('thickness_mm', '==', filters.thickness));
  if (filters.minPrice) q = query(q, where('price', '>=', filters.minPrice));
  if (filters.maxPrice) q = query(q, where('price', '<=', filters.maxPrice));
  if (filters.location) q = query(q, where('location', '==', filters.location));
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Listing);
};

export const getSellerListings = async (sellerId: string) => {
  const q = query(collection(db, 'listings'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Listing);
};

export const createOrder = async (data: Omit<Order, 'id' | 'createdAt'>) => {
  const ref = doc(collection(db, 'orders'));
  await setDoc(ref, { ...data, id: ref.id, createdAt: new Date().toISOString() });
  return ref.id;
};

export const getOrdersForSeller = async (sellerId: string) => {
  const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Order);
};

export const getOrdersForBuyer = async (buyerId: string) => {
  const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Order);
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  await updateDoc(doc(db, 'orders', orderId), { status });
};

export const saveListingForBuyer = async (userId: string, listingId: string) => {
  await setDoc(doc(db, `users/${userId}/savedListings`, listingId), { listingId, savedAt: new Date().toISOString() });
};

export const getSavedListings = async (userId: string) => {
  const snap = await getDocs(collection(db, `users/${userId}/savedListings`));
  return snap.docs.map(doc => doc.id);
};
