"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { Sidebar } from "@/components/dashboard";
import { OnboardingWrapper } from "@/components/onboarding";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-mint)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--text-primary)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <OnboardingProvider>
      <div className="flex h-screen bg-[var(--bg-primary)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
        <OnboardingWrapper />
      </div>
    </OnboardingProvider>
  );
}
