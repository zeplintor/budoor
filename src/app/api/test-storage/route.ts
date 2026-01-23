import { NextResponse } from "next/server";
import { storage } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!bucketName) {
      return NextResponse.json({
        error: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not configured",
      }, { status: 500 });
    }

    // Try multiple bucket name formats
    const bucketNamesToTry = [
      bucketName,
      bucketName.replace(".appspot.com", ".firebasestorage.app"),
      "budoor-406c2",
      "budoor-406c2.firebasestorage.app",
    ];

    const results = [];
    let workingBucket = null;

    for (const testBucketName of bucketNamesToTry) {
      try {
        const bucket = storage.bucket(testBucketName);
        const [exists] = await bucket.exists();

        results.push({
          bucketName: testBucketName,
          exists,
        });

        if (exists && !workingBucket) {
          workingBucket = { name: testBucketName, bucket };
        }
      } catch (error: any) {
        results.push({
          bucketName: testBucketName,
          exists: false,
          error: error.message,
        });
      }
    }

    if (!workingBucket) {
      return NextResponse.json({
        message: "No accessible bucket found. Please check Firebase Console.",
        triedBuckets: results,
        firebaseConsoleUrl: `https://console.firebase.google.com/project/budoor-406c2/storage`,
      });
    }

    const { bucket } = workingBucket;

    // Test if bucket exists by checking metadata
    try {
      const [exists] = await bucket.exists();

      if (!exists) {
        return NextResponse.json({
          bucketName: workingBucket.name,
          exists: false,
          message: "Bucket does not exist. You may need to create it in Firebase Console.",
          firebaseConsoleUrl: `https://console.firebase.google.com/project/budoor-406c2/storage`,
          triedBuckets: results,
        });
      }

      // Try to upload a test file
      const testFile = bucket.file("test/test.txt");
      await testFile.save(Buffer.from("test"), {
        metadata: { contentType: "text/plain" },
      });

      // Get the file's public URL
      await testFile.makePublic();
      const publicUrl = `https://storage.googleapis.com/${workingBucket.name}/${testFile.name}`;

      // Clean up test file
      await testFile.delete();

      return NextResponse.json({
        success: true,
        bucketName: workingBucket.name,
        configuredBucket: bucketName,
        exists: true,
        message: "Bucket exists and is accessible!",
        testUrl: publicUrl,
        triedBuckets: results,
      });
    } catch (bucketError: any) {
      return NextResponse.json({
        bucketName,
        exists: false,
        error: bucketError.message,
        code: bucketError.code,
        details: bucketError.errors?.[0],
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
