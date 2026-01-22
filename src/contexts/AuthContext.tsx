"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  signUp as firebaseSignUp,
  signIn as firebaseSignIn,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
  getUserData,
  handleGoogleRedirect,
} from "@/lib/firebase/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = auth !== null;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle Google redirect result on page load
    handleGoogleRedirect().catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userData = await getUserData(fbUser.uid);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (!isConfigured) throw new Error("Firebase not configured");
    await firebaseSignUp(email, password, displayName);
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) throw new Error("Firebase not configured");
    await firebaseSignIn(email, password);
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) throw new Error("Firebase not configured");
    await firebaseSignInWithGoogle();
  };

  const signOut = async () => {
    if (!isConfigured) throw new Error("Firebase not configured");
    await firebaseSignOut();
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) throw new Error("Firebase not configured");
    await firebaseResetPassword(email);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    isConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
