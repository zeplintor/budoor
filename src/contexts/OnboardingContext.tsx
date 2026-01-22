"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "./AuthContext";

interface OnboardingState {
  welcomeCompleted: boolean;
  tourCompleted: boolean;
  firstParcelleCreated: boolean;
  firstReportViewed: boolean;
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  isLoading: boolean;
  showWelcome: boolean;
  showTour: boolean;
  completeWelcome: () => Promise<void>;
  completeTour: () => Promise<void>;
  markFirstParcelle: () => Promise<void>;
  markFirstReport: () => Promise<void>;
  startTour: () => void;
  resetOnboarding: () => Promise<void>;
}

const defaultState: OnboardingState = {
  welcomeCompleted: false,
  tourCompleted: false,
  firstParcelleCreated: false,
  firstReportViewed: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Load onboarding state from Firestore
  useEffect(() => {
    async function loadOnboardingState() {
      if (!firebaseUser || !db) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const savedState = data.onboarding || defaultState;
          setOnboardingState(savedState);

          // Show welcome if not completed
          if (!savedState.welcomeCompleted) {
            setShowWelcome(true);
          }
        } else {
          // New user - show welcome
          setShowWelcome(true);
        }
      } catch (error) {
        console.error("Error loading onboarding state:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOnboardingState();
  }, [firebaseUser]);

  const saveState = async (newState: Partial<OnboardingState>) => {
    if (!firebaseUser || !db) return;

    const updatedState = { ...onboardingState, ...newState };
    setOnboardingState(updatedState);

    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        onboarding: updatedState,
      });
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
  };

  const completeWelcome = async () => {
    setShowWelcome(false);
    await saveState({ welcomeCompleted: true });
    // Optionally start tour after welcome
    if (!onboardingState.tourCompleted) {
      setTimeout(() => setShowTour(true), 500);
    }
  };

  const completeTour = async () => {
    setShowTour(false);
    await saveState({ tourCompleted: true });
  };

  const markFirstParcelle = async () => {
    if (!onboardingState.firstParcelleCreated) {
      await saveState({ firstParcelleCreated: true });
    }
  };

  const markFirstReport = async () => {
    if (!onboardingState.firstReportViewed) {
      await saveState({ firstReportViewed: true });
    }
  };

  const startTour = () => {
    setShowTour(true);
  };

  const resetOnboarding = async () => {
    setOnboardingState(defaultState);
    setShowWelcome(true);
    if (!firebaseUser || !db) return;

    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        onboarding: defaultState,
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingState,
        isLoading,
        showWelcome,
        showTour,
        completeWelcome,
        completeTour,
        markFirstParcelle,
        markFirstReport,
        startTour,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
