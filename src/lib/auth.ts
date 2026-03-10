import { auth, db } from './firebase';
import { 
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Role } from '@/types';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      id: result.user.uid,
      name: result.user.displayName || 'User',
      email: result.user.email,
      role: 'buyer', // Default
      photoURL: result.user.photoURL,
      createdAt: new Date().toISOString()
    });
  }
  return result.user;
};

export const signInWithEmail = async (email: string, pass: string) => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const signUpWithEmail = async (email: string, pass: string, name: string, role: Role) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await setDoc(doc(db, 'users', res.user.uid), {
    id: res.user.uid,
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  });
  return res.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
  window.location.href = '/';
};

export const getCurrentUser = () => auth.currentUser;

export const useAuthState = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const d = await getDoc(doc(db, 'users', u.uid));
        if (d.exists()) setRole(d.data().role as Role);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, role, loading };
};
