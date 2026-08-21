import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const env = (import.meta as any).env || {};

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBFmbF7vdfgvW9LZ9QaZR-OWxvNKPRaVOU",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "aevora-50cea.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "aevora-50cea",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "aevora-50cea.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "511878697345",
  appId: env.VITE_FIREBASE_APP_ID || "1:511878697345:web:1568f977e06da62acf5880",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-HNB02GTC00"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth, Firestore, & Storage instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore Persistence Function for User Records
export const saveUserToFirestore = async (userObj: any) => {
  try {
    if (!userObj || (!userObj.id && !userObj.email)) return;
    const cleanId = (userObj.id || userObj.email).toString().replace(/[/@.]/g, '_');
    const userRef = doc(db, "users", cleanId);

    const payload = {
      id: userObj.id || cleanId,
      name: userObj.name || 'Hospital User',
      email: userObj.email || '',
      role: userObj.role || 'HOSPITAL_ADMIN',
      organizationId: userObj.organizationId || 'org-apex-01',
      avatarUrl: userObj.avatarUrl || '',
      phone: userObj.phone || '',
      department: userObj.department || '',
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'ACTIVE'
    };

    await setDoc(userRef, payload, { merge: true });
    console.log('✅ User record successfully saved to Firebase Firestore:', cleanId);
  } catch (err) {
    console.warn('Firebase Firestore save notification:', err);
  }
};

// Safe Analytics Initialization
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// Helper auth functions
export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  firebaseSignOut,
  onAuthStateChanged 
};
export type { FirebaseUser };
