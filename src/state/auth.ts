import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  signUp: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      set({ user: userCredential.user });
    } catch (error: any) {
      // Preserve Firebase error with code for proper error handling
      const firebaseError: any = new Error(error.message || 'Failed to sign up');
      firebaseError.code = error.code;
      throw firebaseError;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      set({ user: userCredential.user });
    } catch (error: any) {
      // Preserve Firebase error with code for proper error handling
      const firebaseError: any = new Error(error.message || 'Failed to sign in');
      firebaseError.code = error.code;
      throw firebaseError;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  setInitialized: (initialized: boolean) => set({ initialized }),
}));

// Initialize auth state listener with error handling
try {
  onAuthStateChanged(
    auth,
    (user) => {
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setInitialized(true);
    },
    (error) => {
      console.error('Auth state change error:', error);
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setInitialized(true);
    },
  );
} catch (error) {
  console.error('Failed to initialize auth listener:', error);
  useAuthStore.getState().setLoading(false);
  useAuthStore.getState().setInitialized(true);
}

