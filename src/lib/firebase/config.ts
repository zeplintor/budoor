import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase config - these are public and safe to hard-code
// They're secured by Firebase Security Rules, not by hiding the config
const firebaseConfig = {
  apiKey: "AIzaSyBpddw6FhRhal-NhO06wzbbVqocePcrsAs",
  authDomain: "budoor-406c2.firebaseapp.com",
  projectId: "budoor-406c2",
  storageBucket: "budoor-406c2.firebasestorage.app",
  messagingSenderId: "1060953515791",
  appId: "1:1060953515791:web:e66f1b3a0de8aba5b5807a",
};

// Check if Firebase config is valid
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only if configured (prevent build errors)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
export default app;
