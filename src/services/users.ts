import { doc, getDoc, type Firestore } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data.uid,
        username: data.username,
        email: data.email,
        displayName: data.displayName || data.username,
        avatar: data.avatar,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get username from Firebase Auth user or Firestore
 */
export const getUsername = async (user: User): Promise<string> => {
  // First try to get from Firestore
  const profile = await getUserProfile(user.uid);
  if (profile?.username) {
    return profile.username;
  }
  
  // Fallback to displayName or email
  return user.displayName || user.email?.split('@')[0] || 'Anonymous';
};

