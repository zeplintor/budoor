import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { AgronomicReport } from "@/lib/api/claudeService";

function ensureDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

export interface SavedReport extends AgronomicReport {
  odId: string; // Firestore document ID
  odUserId: string;
  savedAt: Date;
}

export async function saveReport(
  userId: string,
  report: AgronomicReport
): Promise<string> {
  const dbInstance = ensureDb();
  const reportsRef = collection(dbInstance, "users", userId, "reports");

  const reportData = {
    odUserId: userId,
    ...report,
    generatedAt: Timestamp.fromDate(new Date(report.generatedAt)),
    savedAt: serverTimestamp(),
  };

  const docRef = await addDoc(reportsRef, reportData);
  return docRef.id;
}

export async function getReports(
  userId: string,
  maxReports: number = 50
): Promise<SavedReport[]> {
  const dbInstance = ensureDb();
  const reportsRef = collection(dbInstance, "users", userId, "reports");
  const q = query(reportsRef, orderBy("savedAt", "desc"), limit(maxReports));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      odId: docSnap.id,
      generatedAt: data.generatedAt?.toDate() || new Date(),
      savedAt: data.savedAt?.toDate() || new Date(),
    } as SavedReport;
  });
}

export async function getReportsByParcelle(
  userId: string,
  parcelleId: string,
  maxReports: number = 10
): Promise<SavedReport[]> {
  const dbInstance = ensureDb();
  const reportsRef = collection(dbInstance, "users", userId, "reports");
  const q = query(
    reportsRef,
    where("parcelleId", "==", parcelleId),
    orderBy("savedAt", "desc"),
    limit(maxReports)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      odId: docSnap.id,
      generatedAt: data.generatedAt?.toDate() || new Date(),
      savedAt: data.savedAt?.toDate() || new Date(),
    } as SavedReport;
  });
}

export async function getReport(
  userId: string,
  reportId: string
): Promise<SavedReport | null> {
  const dbInstance = ensureDb();
  const reportRef = doc(dbInstance, "users", userId, "reports", reportId);
  const docSnap = await getDoc(reportRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    odId: docSnap.id,
    generatedAt: data.generatedAt?.toDate() || new Date(),
    savedAt: data.savedAt?.toDate() || new Date(),
  } as SavedReport;
}

export async function deleteReport(
  userId: string,
  reportId: string
): Promise<void> {
  const dbInstance = ensureDb();
  const reportRef = doc(dbInstance, "users", userId, "reports", reportId);
  await deleteDoc(reportRef);
}
