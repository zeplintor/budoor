import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { User } from "@/types";

const googleProvider = new GoogleAuthProvider();

function ensureAuth() {
  if (!auth) throw new Error("Firebase Auth not configured");
  return auth;
}

function ensureDb() {
  if (!db) throw new Error("Firebase Firestore not configured");
  return db;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const authInstance = ensureAuth();
  const { user } = await createUserWithEmailAndPassword(authInstance, email, password);

  await updateProfile(user, { displayName });

  // Create user document in Firestore
  await createUserDocument(user, displayName);

  return user;
}

export async function signIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const authInstance = ensureAuth();
  const { user } = await signInWithEmailAndPassword(authInstance, email, password);
  return user;
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  const authInstance = ensureAuth();

  try {
    // Use redirect method for better cross-origin compatibility
    await signInWithRedirect(authInstance, googleProvider);
    return null;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

// Handle redirect result (call this on app init)
export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  const authInstance = ensureAuth();

  try {
    const result = await getRedirectResult(authInstance);
    if (result?.user) {
      await handleGoogleUser(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("Redirect error:", error);
  }
  return null;
}

async function handleGoogleUser(user: FirebaseUser): Promise<void> {
  const dbInstance = ensureDb();

  // Check if user document exists, if not create it
  const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user, user.displayName || "Utilisateur");
  }
}

export async function signOut(): Promise<void> {
  const authInstance = ensureAuth();
  await firebaseSignOut(authInstance);
}

export async function resetPassword(email: string): Promise<void> {
  const authInstance = ensureAuth();
  await sendPasswordResetEmail(authInstance, email);
}

async function createUserDocument(
  firebaseUser: FirebaseUser,
  displayName: string
): Promise<void> {
  const dbInstance = ensureDb();
  const userRef = doc(dbInstance, "users", firebaseUser.uid);

  const userData: Omit<User, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName,
    phoneVerified: false,
    language: "fr",
    notificationFrequency: "weekly",
    subscription: "free",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
}

export async function getUserData(uid: string): Promise<User | null> {
  const dbInstance = ensureDb();
  const userDoc = await getDoc(doc(dbInstance, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
}
