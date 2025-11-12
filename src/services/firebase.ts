import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableNetwork, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase config - replace with your Firebase project credentials
// Get these from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate Firebase config
const isConfigValid = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

if (!isConfigValid) {
  console.error('Firebase config is missing or incomplete. Please check your environment variables.');
}

// Initialize Firebase
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    if (!isConfigValid) {
      throw new Error('Firebase configuration is incomplete. Cannot initialize Firebase.');
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Auth - Firebase handles persistence automatically in React Native
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Ensure Firestore network is enabled
enableNetwork(db).catch((err) => {
  console.warn('Firestore network enable warning:', err);
});

// Initialize Storage
export const storage: FirebaseStorage = getStorage(app);

export default app;

