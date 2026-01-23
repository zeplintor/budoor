import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;
    const hasCredentialsPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    let initStatus = "not initialized";
    let initError = null;

    try {
      // Try to import and check firebase-admin
      const { storage, adminApp } = await import("@/lib/firebase-admin");

      if (adminApp) {
        initStatus = "initialized";

        // Try to access storage
        try {
          const bucket = storage.bucket();
          initStatus = `initialized with bucket: ${bucket.name}`;
        } catch (storageError: any) {
          initError = `Storage error: ${storageError.message}`;
        }
      }
    } catch (error: any) {
      initError = `Import error: ${error.message}`;
    }

    return NextResponse.json({
      status: "ok",
      environment: {
        hasServiceAccount,
        hasCredentialsPath,
        storageBucket,
        serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0,
      },
      firebaseAdmin: {
        initStatus,
        initError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
