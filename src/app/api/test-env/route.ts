import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY ? "configured" : "missing",
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY ? "configured" : "missing",
      ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY ? "configured" : "missing",
      FIREBASE_SERVICE_ACCOUNT_BASE64: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? "configured" : "missing",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "missing",
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
