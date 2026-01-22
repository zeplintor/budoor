import { NextRequest, NextResponse } from "next/server";
import {
  createSubscriptionCheckout,
  DODO_PRODUCTS,
} from "@/lib/payments/dodo";

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variable status (not values!)
    console.log("ENV CHECK:", {
      NEXT_PUBLIC_DODO_MODE: process.env.NEXT_PUBLIC_DODO_MODE || "NOT SET",
      DODO_API_KEY_TEST: process.env.DODO_API_KEY_TEST ? "SET" : "NOT SET",
      DODO_API_KEY_LIVE: process.env.DODO_API_KEY_LIVE ? "SET" : "NOT SET",
      DODO_PRO_PRODUCT_ID: process.env.DODO_PRO_PRODUCT_ID || "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    });

    const { userId, email, plan } = await request.json();

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    // Only Pro plan for now
    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan. Only 'pro' is supported" },
        { status: 400 }
      );
    }

    // Get the base URL for return URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    const session = await createSubscriptionCheckout({
      userId,
      email,
      productId: DODO_PRODUCTS.PRO_MONTHLY,
      returnUrl: `${baseUrl}/dashboard/pricing?success=true`,
    });

    return NextResponse.json({
      checkoutUrl: session.payment_link,
      subscriptionId: session.subscription_id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
