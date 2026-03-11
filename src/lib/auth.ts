import { auth, db } from './firebase';
import { 
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Role } from '@/types';

export const signInWithGoogle = async (role: Role = 'buyer') => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email,
        role: role,
        photoURL: result.user.photoURL || null,
        createdAt: serverTimestamp()
      });
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error) {
    console.error("Email Sign-In Error:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name: string, role: Role) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, 'users', res.user.uid), {
      id: res.user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp()
    });
    return res.user;
  } catch (error) {
    console.error("Email Sign-Up Error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};

export const getCurrentUser = () => auth.currentUser;

export const useAuthState = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const d = await getDoc(doc(db, 'users', u.uid));
          if (d.exists()) {
            setRole(d.data().role as Role);
          } else {
             setRole(null);
          }
        } catch (error) {
           console.error("Error fetching user role:", error);
           setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, role, loading };
};
