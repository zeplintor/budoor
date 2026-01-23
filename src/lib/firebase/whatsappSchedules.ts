import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "./config";

function ensureDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

export interface WhatsAppSchedule {
  id: string;
  userId: string;
  parcelleId: string;
  parcelleName: string;
  
  // Scheduling
  isActive: boolean;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format (24h)
  timezone: string; // e.g., "Africa/Casablanca"
  
  // Content
  includeAudio: boolean; // Include audio narration
  includeChart: boolean; // Include soil/weather chart
  customMessage?: string; // Optional prefix message
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSentAt?: Date;
  nextSendAt?: Date;
  sendCount: number;
}

export interface WhatsAppScheduleFormData {
  parcelleId: string;
  parcelleName: string;
  isActive: boolean;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  daysOfWeek?: number[];
  dayOfMonth?: number;
  time: string;
  timezone: string;
  includeAudio: boolean;
  includeChart: boolean;
  customMessage?: string;
}

/**
 * Create a new WhatsApp report schedule
 */
export async function createWhatsAppSchedule(
  userId: string,
  scheduleData: WhatsAppScheduleFormData
): Promise<string> {
  const dbInstance = ensureDb();
  const schedulesRef = collection(dbInstance, "users", userId, "whatsappSchedules");

  const schedule = {
    userId,
    ...scheduleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    sendCount: 0,
  };

  const docRef = await addDoc(schedulesRef, schedule);
  return docRef.id;
}

/**
 * Get all WhatsApp schedules for a user
 */
export async function getWhatsAppSchedules(userId: string): Promise<WhatsAppSchedule[]> {
  const dbInstance = ensureDb();
  const schedulesRef = collection(dbInstance, "users", userId, "whatsappSchedules");
  
  const q = query(schedulesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    lastSentAt: doc.data().lastSentAt?.toDate(),
    nextSendAt: doc.data().nextSendAt?.toDate(),
  } as WhatsAppSchedule));
}

/**
 * Get a specific WhatsApp schedule
 */
export async function getWhatsAppSchedule(
  userId: string,
  scheduleId: string
): Promise<WhatsAppSchedule | null> {
  const dbInstance = ensureDb();
  const scheduleRef = doc(dbInstance, "users", userId, "whatsappSchedules", scheduleId);
  const docSnap = await getDoc(scheduleRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    lastSentAt: docSnap.data().lastSentAt?.toDate(),
    nextSendAt: docSnap.data().nextSendAt?.toDate(),
  } as WhatsAppSchedule;
}

/**
 * Update a WhatsApp schedule
 */
export async function updateWhatsAppSchedule(
  userId: string,
  scheduleId: string,
  updates: Partial<WhatsAppScheduleFormData>
): Promise<void> {
  const dbInstance = ensureDb();
  const scheduleRef = doc(dbInstance, "users", userId, "whatsappSchedules", scheduleId);

  await updateDoc(scheduleRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a WhatsApp schedule
 */
export async function deleteWhatsAppSchedule(
  userId: string,
  scheduleId: string
): Promise<void> {
  const dbInstance = ensureDb();
  const scheduleRef = doc(dbInstance, "users", userId, "whatsappSchedules", scheduleId);
  await deleteDoc(scheduleRef);
}

/**
 * Toggle schedule active status
 */
export async function toggleWhatsAppScheduleActive(
  userId: string,
  scheduleId: string,
  isActive: boolean
): Promise<void> {
  await updateWhatsAppSchedule(userId, scheduleId, { isActive });
}

/**
 * Get all active schedules due for sending (for Cloud Function)
 */
export async function getActiveSchedulesDueForSending(): Promise<
  Array<WhatsAppSchedule & { userId: string }>
> {
  // This would be called by a Cloud Function
  // Filter schedules where isActive=true and nextSendAt <= now
  // For now, this is a placeholder for the Cloud Function implementation
  return [];
}

/**
 * Mark schedule as sent and update next send time
 */
export async function markScheduleAsSent(
  userId: string,
  scheduleId: string,
  nextSendAt: Date
): Promise<void> {
  const dbInstance = ensureDb();
  const scheduleRef = doc(dbInstance, "users", userId, "whatsappSchedules", scheduleId);

  await updateDoc(scheduleRef, {
    lastSentAt: serverTimestamp(),
    nextSendAt: Timestamp.fromDate(nextSendAt),
    sendCount: incrementField(),
    updatedAt: serverTimestamp(),
  });
}

// Helper to increment sendCount
function incrementField() {
  // Note: In production, use FieldValue.increment() from Firebase Admin SDK
  return undefined; // Placeholder
}
