import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { UserSettings } from "@/types";

/**
 * Get user settings from Firestore
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (!db) throw new Error("Firebase not initialized");

  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return data.settings || null;
}

/**
 * Update user settings in Firestore
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create user document if it doesn't exist
    await setDoc(userRef, {
      settings: {
        ...settings,
        whatsappVerified: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Update existing user document
    await updateDoc(userRef, {
      settings: {
        ...userDoc.data().settings,
        ...settings,
      },
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Update user profile (displayName, etc.)
 */
export async function updateUserProfile(
  userId: string,
  profile: {
    displayName?: string;
    phone?: string;
  }
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create user document if it doesn't exist
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Set WhatsApp number and notification preferences
 */
export async function setWhatsAppSettings(
  userId: string,
  whatsappNumber: string,
  notificationFrequency: "daily" | "weekly" | "none"
): Promise<void> {
  await updateUserSettings(userId, {
    whatsappNumber,
    notificationFrequency,
    whatsappVerified: false, // Will need to be verified via Twilio
  });
}
