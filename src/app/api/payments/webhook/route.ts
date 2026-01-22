import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, type DodoWebhookEvent } from "@/lib/payments/dodo";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("dodo-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: DodoWebhookEvent = JSON.parse(payload);
    console.log("DODO Webhook received:", event.type);

    // Get Firebase user ID from metadata
    const firebaseUid = event.data?.metadata?.firebase_uid;

    if (!firebaseUid) {
      console.error("No firebase_uid in webhook metadata");
      return NextResponse.json({ received: true });
    }

    if (!db) {
      console.error("Firebase not initialized");
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userRef = doc(db, "users", firebaseUid);

    switch (event.type) {
      case "subscription.active":
      case "subscription.created":
        // User subscribed to Pro
        await updateDoc(userRef, {
          subscription: "pro",
          subscriptionId: event.data.subscription_id,
          subscriptionStatus: "active",
          updatedAt: serverTimestamp(),
        });
        console.log(`User ${firebaseUid} upgraded to Pro`);
        break;

      case "subscription.cancelled":
      case "subscription.expired":
        // User's subscription ended
        await updateDoc(userRef, {
          subscription: "free",
          subscriptionStatus: event.type === "subscription.cancelled" ? "cancelled" : "expired",
          updatedAt: serverTimestamp(),
        });
        console.log(`User ${firebaseUid} downgraded to Free`);
        break;

      case "subscription.on_hold":
      case "subscription.paused":
        // Subscription paused (payment issue or user action)
        await updateDoc(userRef, {
          subscriptionStatus: "paused",
          updatedAt: serverTimestamp(),
        });
        console.log(`User ${firebaseUid} subscription paused`);
        break;

      case "payment.succeeded":
        // Payment successful - could send confirmation email/WhatsApp
        console.log(`Payment succeeded for user ${firebaseUid}`);
        break;

      case "payment.failed":
        // Payment failed - could notify user
        console.log(`Payment failed for user ${firebaseUid}`);
        break;

      case "refund.succeeded":
        // Refund processed - downgrade user
        await updateDoc(userRef, {
          subscription: "free",
          subscriptionStatus: "refunded",
          updatedAt: serverTimestamp(),
        });
        console.log(`Refund processed for user ${firebaseUid}`);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
