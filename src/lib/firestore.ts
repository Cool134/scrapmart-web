import { db } from './firebase';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  getDoc, getDocs, query, where, orderBy, limit 
} from 'firebase/firestore';
import { User, Listing, ListingImage, Message, RFQRequest, SearchFilters, Role } from '@/types';

// --- USER FUNCTIONS ---

export const createUserProfile = async (data: Omit<User, 'createdAt' | 'rating' | 'verified'>) => {
  try {
    const userRef = doc(db, 'users', data.id);
    await setDoc(userRef, {
      ...data,
      verified: false,
      rating: 0, // Initial rating
      createdAt: new Date().toISOString()
    }, { merge: true }); // Use merge to avoid overwriting on subsequent calls (e.g. Google sign-in)
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Failed to create user profile.");
  }
};

export const getUserProfile = async (id: string): Promise<User | null> => {
  try {
    const d = await getDoc(doc(db, 'users', id));
    return d.exists() ? (d.data() as User) : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile.");
  }
};

export const updateUserProfile = async (id: string, data: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile.");
  }
};

// --- LISTING FUNCTIONS ---

export const createListing = async (data: Omit<Listing, 'id' | 'createdAt' | 'status'>) => {
  try {
    const ref = doc(collection(db, 'listings'));
    const now = new Date().toISOString();
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
      createdAt: now, 
      status: 'active' // Default status for new listings
    });
    return ref.id;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw new Error("Failed to create listing in database.");
  }
};

export const updateListing = async (id: string, data: Partial<Omit<Listing, 'id' | 'createdAt'>>) => {
  try {
    const ref = doc(db, 'listings', id);
    await updateDoc(ref, { 
      ...data, 
      // updatedAt: new Date().toISOString() // No 'updatedAt' in new schema
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

export const getListings = async (filters: SearchFilters = {}, limitResults?: number): Promise<Listing[]> => {
  try {
    let q = query(collection(db, 'listings'), where('status', '==', 'active'));
    
    if (filters.material) {
      q = query(q, where('materialType', '==', filters.material)); // Use materialType
    }
    if (filters.thickness) {
      q = query(q, where('thickness', '<=', filters.thickness)); // Use thickness, assume <= for max thickness
    }
    if (filters.weight) {
      q = query(q, where('weight', '<=', filters.weight)); // New filter for weight
    }
    if (filters.minPrice !== undefined) {
      q = query(q, where('pricePerKg', '>=', filters.minPrice)); // Use pricePerKg
    }
    if (filters.maxPrice !== undefined) {
      q = query(q, where('pricePerKg', '<=', filters.maxPrice)); // Use pricePerKg
    }
    if (filters.location) {
      // Basic exact match for MVP. A real app needs geohashing or more advanced geo-queries.
      q = query(q, where('location', '==', filters.location));
    }

    q = query(q, orderBy('createdAt', 'desc')); // Default sort newest
    if (limitResults) {
      q = query(q, limit(limitResults));
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

// --- LISTING IMAGE FUNCTIONS ---

export const addListingImage = async (data: Omit<ListingImage, 'id'>) => {
  try {
    const ref = doc(collection(db, 'listing_images'));
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
    });
    return ref.id;
  } catch (error) {
    console.error("Error adding listing image:", error);
    throw new Error("Failed to add listing image.");
  }
};

export const getListingImages = async (listingId: string): Promise<ListingImage[]> => {
  try {
    const q = query(
      collection(db, 'listing_images'), 
      where('listingId', '==', listingId), 
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as ListingImage);
  } catch (error) {
    console.error("Error fetching listing images:", error);
    return [];
  }
};

// --- MESSAGE FUNCTIONS ---

export const addMessage = async (data: Omit<Message, 'id' | 'timestamp'>) => {
  try {
    const ref = doc(collection(db, 'messages'));
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
      timestamp: new Date().toISOString() 
    });
    return ref.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to add message.");
  }
};

export const getMessagesForListing = async (listingId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'messages'), 
      where('listingId', '==', listingId), 
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Message);
  } catch (error) {
    console.error("Error fetching messages for listing:", error);
    return [];
  }
};

export const getMessagesBetweenUsers = async (user1Id: string, user2Id: string, listingId?: string): Promise<Message[]> => {
  try {
    // This query is simplified for MVP. For a robust chat, conversation IDs are better.
    let q = query(collection(db, 'messages'));

    if (listingId) {
      q = query(q, where('listingId', '==', listingId));
    }

    // Fetch messages where (sender is user1 AND receiver is user2) OR (sender is user2 AND receiver is user1)
    const q1 = query(q, where('buyerId', '==', user1Id), where('sellerId', '==', user2Id));
    const q2 = query(q, where('buyerId', '==', user2Id), where('sellerId', '==', user1Id));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const allMessages = [...snap1.docs.map(doc => doc.data() as Message), ...snap2.docs.map(doc => doc.data() as Message)];

    return allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  } catch (error) {
    console.error("Error fetching messages between users:", error);
    return [];
  }
};

// --- RFQ REQUEST FUNCTIONS ---

export const createRFQRequest = async (data: Omit<RFQRequest, 'id' | 'createdAt' | 'status'>) => {
  try {
    const ref = doc(collection(db, 'rfq_requests'));
    await setDoc(ref, { 
      ...data, 
      id: ref.id, 
      status: 'pending', // Default status
      createdAt: new Date().toISOString() 
    });
    return ref.id;
  } catch (error) {
    console.error("Error creating RFQ request:", error);
    throw new Error("Failed to create RFQ request.");
  }
};

export const updateRFQRequestStatus = async (id: string, status: RFQRequest['status'], priceOffered?: number) => {
  try {
    const ref = doc(db, 'rfq_requests', id);
    const updateData: Partial<RFQRequest> = { status };
    if (priceOffered !== undefined) {
      updateData.priceOffered = priceOffered;
    }
    await updateDoc(ref, updateData);
  } catch (error) {
    console.error("Error updating RFQ request status:", error);
    throw new Error("Failed to update RFQ request status.");
  }
};

export const getRFQRequestsForSeller = async (sellerId: string): Promise<RFQRequest[]> => {
  try {
    const q = query(
      collection(db, 'rfq_requests'), 
      where('sellerId', '==', sellerId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as RFQRequest);
  } catch (error) {
    console.error("Error fetching seller RFQ requests:", error);
    return [];
  }
};

export const getRFQRequestsForBuyer = async (buyerId: string): Promise<RFQRequest[]> => {
  try {
    const q = query(
      collection(db, 'rfq_requests'), 
      where('buyerId', '==', buyerId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as RFQRequest);
  } catch (error) {
    console.error("Error fetching buyer RFQ requests:", error);
    return [];
  }
};

export const getListingById = getListing;

// Removed old `Order` related functions to replace with RFQ. 
// If Order collection is still needed for accepted RFQs, it can be re-added.
