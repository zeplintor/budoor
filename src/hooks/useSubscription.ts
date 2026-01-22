"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "paused" | "expired" | "refunded" | null;

interface SubscriptionState {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  subscriptionId: string | null;
  loading: boolean;
  error: string | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
  isPro: boolean;
  isFree: boolean;
  isActive: boolean;
  upgradeToPro: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => void;
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxParcelles: 3,
    maxReportsPerMonth: 5,
    whatsappFrequency: "weekly" as const,
    dataHistoryDays: 30,
  },
  pro: {
    maxParcelles: Infinity,
    maxReportsPerMonth: Infinity,
    whatsappFrequency: "daily" as const,
    dataHistoryDays: 365,
  },
};

export function useSubscription(): UseSubscriptionReturn {
  const { user, firebaseUser } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    status: null,
    subscriptionId: null,
    loading: true,
    error: null,
  });

  // Listen to user subscription changes in Firestore
  useEffect(() => {
    if (!firebaseUser?.uid || !db) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", firebaseUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setState({
            plan: data?.subscription || "free",
            status: data?.subscriptionStatus || null,
            subscriptionId: data?.subscriptionId || null,
            loading: false,
            error: null,
          });
        } else {
          setState({
            plan: "free",
            status: null,
            subscriptionId: null,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        console.error("Error listening to subscription:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load subscription data",
        }));
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  // Upgrade to Pro
  const upgradeToPro = useCallback(async () => {
    if (!firebaseUser?.uid || !firebaseUser?.email) {
      throw new Error("User not authenticated");
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          plan: "pro",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to DODO Payments checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error upgrading to Pro:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to upgrade",
      }));
      throw error;
    }
  }, [firebaseUser?.uid, firebaseUser?.email]);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!firebaseUser?.uid) {
      throw new Error("User not authenticated");
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: firebaseUser.uid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // State will be updated via Firestore listener
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to cancel",
      }));
      throw error;
    }
  }, [firebaseUser?.uid]);

  // Force refresh subscription data
  const refreshSubscription = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
  }, []);

  return {
    ...state,
    isPro: state.plan === "pro",
    isFree: state.plan === "free",
    isActive: state.status === "active" || state.plan === "pro",
    upgradeToPro,
    cancelSubscription,
    refreshSubscription,
  };
}

/**
 * Hook to check if user can perform an action based on their plan
 */
export function useCanPerformAction(action: "createParcelle" | "generateReport" | "setDailyNotifications") {
  const { plan } = useSubscription();
  const limits = PLAN_LIMITS[plan];

  switch (action) {
    case "createParcelle":
      // This would need to check current parcelle count
      return { allowed: true, limit: limits.maxParcelles };
    case "generateReport":
      // This would need to check reports this month
      return { allowed: true, limit: limits.maxReportsPerMonth };
    case "setDailyNotifications":
      return { allowed: plan === "pro", limit: null };
    default:
      return { allowed: true, limit: null };
  }
}
