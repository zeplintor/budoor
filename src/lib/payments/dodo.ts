import DodoPayments from "dodopayments";

// Initialize DODO Payments client
const isTestMode = process.env.NEXT_PUBLIC_DODO_MODE !== "live";
const apiKey = isTestMode
  ? process.env.DODO_API_KEY_TEST
  : process.env.DODO_API_KEY_LIVE;

let dodoClient: DodoPayments | null = null;

function getDodoClient(): DodoPayments {
  if (!apiKey) {
    throw new Error("DODO Payments API key not configured");
  }

  if (!dodoClient) {
    dodoClient = new DodoPayments({
      bearerToken: apiKey,
    });
  }

  return dodoClient;
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(params: {
  userId: string;
  email: string;
  productId: string;
  returnUrl: string;
}) {
  const dodo = getDodoClient();

  const subscription = await dodo.subscriptions.create({
    billing: {
      country: "FR",
    },
    customer: {
      email: params.email,
      name: params.email.split("@")[0],
    },
    product_id: params.productId,
    quantity: 1,
    payment_link: true,
    return_url: params.returnUrl,
    metadata: {
      firebase_uid: params.userId,
    },
  });

  return subscription;
}

/**
 * Create a one-time payment checkout session
 */
export async function createPaymentCheckout(params: {
  userId: string;
  email: string;
  productId: string;
  returnUrl: string;
}) {
  const dodo = getDodoClient();

  const payment = await dodo.payments.create({
    billing: {
      country: "FR",
    },
    customer: {
      email: params.email,
      name: params.email.split("@")[0],
    },
    product_cart: [
      {
        product_id: params.productId,
        quantity: 1,
      },
    ],
    payment_link: true,
    return_url: params.returnUrl,
    metadata: {
      firebase_uid: params.userId,
    },
  });

  return payment;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const dodo = getDodoClient();
  return await dodo.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription (at end of billing period)
 */
export async function cancelSubscription(subscriptionId: string) {
  const dodo = getDodoClient();
  return await dodo.subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: true,
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("DODO_WEBHOOK_SECRET not configured, skipping verification");
    return true; // Skip verification in development
  }

  // DODO uses HMAC-SHA256 for webhook signatures
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

/**
 * Product IDs - these should match your DODO dashboard products
 */
export const DODO_PRODUCTS = {
  PRO_MONTHLY: process.env.DODO_PRO_PRODUCT_ID || "prod_budoor_pro_monthly",
} as const;

export type DodoWebhookEvent = {
  type: string;
  data: {
    subscription_id?: string;
    payment_id?: string;
    customer?: {
      email: string;
    };
    metadata?: {
      firebase_uid?: string;
    };
    status?: string;
  };
};
