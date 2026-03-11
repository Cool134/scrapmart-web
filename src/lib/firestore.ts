import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Listing, Order, SearchFilters } from '@/types';

export const createListing = async (data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const ref = doc(collection(db, 'listings'));
    const now = new Date().toISOString();
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
      createdAt: now, 
      updatedAt: now 
    });
    return ref.id;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw new Error("Failed to create listing in database.");
  }
};

export const updateListing = async (id: string, data: Partial<Listing>) => {
  try {
    const ref = doc(db, 'listings', id);
    await updateDoc(ref, { 
      ...data, 
      updatedAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    throw new Error("Failed to update listing.");
  }
};

export const deleteListing = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'listings', id));
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing.");
  }
};

export const getListing = async (id: string): Promise<Listing | null> => {
  try {
    const d = await getDoc(doc(db, 'listings', id));
    return d.exists() ? (d.data() as Listing) : null;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw new Error("Failed to fetch listing details.");
  }
};

export const getListings = async (filters: SearchFilters = {}): Promise<Listing[]> => {
  try {
    let q = query(collection(db, 'listings'), where('status', '==', 'active'));
    
    if (filters.material) {
      q = query(q, where('material', '==', filters.material));
    }
    if (filters.thickness) {
      q = query(q, where('thickness_mm', '==', filters.thickness));
    }
    if (filters.minPrice !== undefined) {
      q = query(q, where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      q = query(q, where('price', '<=', filters.maxPrice));
    }
    if (filters.location) {
      // Basic exact match for MVP. A real app needs geohashing.
      q = query(q, where('location', '==', filters.location));
    }
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Listing);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};

export const getSellerListings = async (sellerId: string): Promise<Listing[]> => {
  try {
    const q = query(
      collection(db, 'listings'), 
      where('sellerId', '==', sellerId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Listing);
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    return [];
  }
};

export const createOrder = async (data: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    const ref = doc(collection(db, 'orders'));
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
      createdAt: new Date().toISOString() 
    });
    return ref.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to submit purchase request.");
  }
};

export const getOrdersForSeller = async (sellerId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('sellerId', '==', sellerId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Order);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return [];
  }
};

export const getOrdersForBuyer = async (buyerId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('buyerId', '==', buyerId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Order);
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status.");
  }
};

export const saveListingForBuyer = async (userId: string, listingId: string) => {
  try {
    await setDoc(doc(db, `users/${userId}/savedListings`, listingId), { 
      listingId, 
      savedAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error saving listing:", error);
    throw new Error("Failed to save listing.");
  }
};

export const getSavedListings = async (userId: string): Promise<Listing[]> => {
  try {
    const snap = await getDocs(collection(db, `users/${userId}/savedListings`));
    const listingIds = snap.docs.map(doc => doc.id);
    
    if (listingIds.length === 0) return [];

    // Firestore 'in' queries support max 10 items. Splitting logic for safety.
    const chunks = [];
    for (let i = 0; i < listingIds.length; i += 10) {
      chunks.push(listingIds.slice(i, i + 10));
    }

    const listingPromises = chunks.map(chunk => {
      const q = query(collection(db, 'listings'), where('id', 'in', chunk));
      return getDocs(q);
    });

    const snapshots = await Promise.all(listingPromises);
    const listings: Listing[] = [];
    snapshots.forEach(snapshot => {
      snapshot.forEach(doc => listings.push(doc.data() as Listing));
    });

    return listings;
  } catch (error) {
    console.error("Error fetching saved listings:", error);
    return [];
  }
};
