import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Parcelle } from "@/types";

function ensureDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

export interface CreateParcelleData {
  userId: string;
  name: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  centroid: {
    lat: number;
    lng: number;
  };
  areaHectares: number;
  cultureType: string;
  dateSeeding?: Date;
  // Agronomic profile
  plantingDate?: Date;
  treeHeight?: number;
  treeCondition?: "excellent" | "good" | "average" | "poor";
  plantingDensity?: number;
  irrigationType?: "drip" | "sprinkler" | "gravity" | "rainfed";
  soilType?: "clay" | "loam" | "sandy" | "calcareous" | "silty";
  lastTreatmentDate?: Date;
  yieldTarget?: number;
  phenologicalStage?: "germination" | "growth" | "flowering" | "fruiting" | "maturation" | "dormancy";
}

export async function createParcelle(data: CreateParcelleData): Promise<string> {
  const dbInstance = ensureDb();
  const parcellesRef = collection(dbInstance, "users", data.userId, "parcelles");

  // Serialize geometry coordinates to JSON string (Firestore doesn't support nested arrays)
  const profile: Record<string, unknown> = {};
  if (data.plantingDate) profile.plantingDate = Timestamp.fromDate(data.plantingDate);
  if (data.treeHeight !== undefined) profile.treeHeight = data.treeHeight;
  if (data.treeCondition) profile.treeCondition = data.treeCondition;
  if (data.plantingDensity !== undefined) profile.plantingDensity = data.plantingDensity;
  if (data.irrigationType) profile.irrigationType = data.irrigationType;
  if (data.soilType) profile.soilType = data.soilType;
  if (data.lastTreatmentDate) profile.lastTreatmentDate = Timestamp.fromDate(data.lastTreatmentDate);
  if (data.yieldTarget !== undefined) profile.yieldTarget = data.yieldTarget;
  if (data.phenologicalStage) profile.phenologicalStage = data.phenologicalStage;

  const parcelleData = {
    userId: data.userId,
    name: data.name,
    geometryType: data.geometry.type,
    geometryCoordinates: JSON.stringify(data.geometry.coordinates),
    centroid: data.centroid,
    areaHectares: data.areaHectares,
    culture: {
      type: data.cultureType,
      dateSeeding: data.dateSeeding ? Timestamp.fromDate(data.dateSeeding) : null,
      currentStage: null,
    },
    profile: Object.keys(profile).length > 0 ? profile : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(parcellesRef, parcelleData);
  return docRef.id;
}

export async function getParcelles(userId: string): Promise<Parcelle[]> {
  const dbInstance = ensureDb();
  const parcellesRef = collection(dbInstance, "users", userId, "parcelles");
  const q = query(parcellesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    // Parse geometry coordinates from JSON string
    return {
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      geometry: {
        type: data.geometryType || "Polygon",
        coordinates: JSON.parse(data.geometryCoordinates),
      },
      centroid: data.centroid,
      areaHectares: data.areaHectares,
      culture: data.culture,
      profile: data.profile ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Parcelle;
  });
}

export async function updateParcelle(
  userId: string,
  parcelleId: string,
  data: Partial<Omit<Parcelle, "id" | "userId" | "createdAt">>
): Promise<void> {
  const dbInstance = ensureDb();
  const parcelleRef = doc(dbInstance, "users", userId, "parcelles", parcelleId);

  await updateDoc(parcelleRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteParcelle(userId: string, parcelleId: string): Promise<void> {
  const dbInstance = ensureDb();
  const parcelleRef = doc(dbInstance, "users", userId, "parcelles", parcelleId);
  await deleteDoc(parcelleRef);
}
