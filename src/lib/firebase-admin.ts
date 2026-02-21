import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (server-side only)
if (!admin.apps.length) {
  try {
    // Support multiple initialization strategies:
    // 1) Use a FIREBASE_SERVICE_ACCOUNT JSON string in env (recommended for CI/Netlify)
    // 2) Use GOOGLE_APPLICATION_CREDENTIALS file path (local dev / gcloud ADC)
    // 3) Fallback to applicationDefault() if available

    // Resolve storage bucket — NEXT_PUBLIC_ vars may be inlined at build time and absent at runtime
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
      || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      || "budoor-406c2.firebasestorage.app";

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      // Decode base64 encoded service account
      const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket,
      });
      console.log("✅ Firebase Admin initialized with SERVICE_ACCOUNT_BASE64");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket,
      });
      console.log("✅ Firebase Admin initialized with SERVICE_ACCOUNT");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket,
      });
      console.log("✅ Firebase Admin initialized with APPLICATION_CREDENTIALS");
    } else {
      // Last resort: try application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket,
      });
      console.log("✅ Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    throw new Error(`Failed to initialize Firebase Admin: ${error}`);
  }
}

// Export services - will throw if not initialized
export const adminApp = admin.app();
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const storage = admin.storage();

export default admin;
