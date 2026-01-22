"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Sprout,
  LogOut,
  Bell,
  HelpCircle,
  User,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export function MobileHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Get current page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return t("nav.home");
    if (pathname.includes("/parcelles")) return t("nav.parcelles");
    if (pathname.includes("/reports")) return t("nav.reports");
    if (pathname.includes("/settings")) return t("nav.settings");
    return "Budoor";
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden bg-[var(--bg-primary)] border-b border-[var(--border-muted)]">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center h-10 w-10 -ml-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-[var(--text-primary)]" />
          </button>

          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {getPageTitle()}
          </h1>

          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]"
          >
            <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
          </Link>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] bg-[var(--bg-dark)] transform transition-transform duration-300 ease-in-out md:hidden",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border-dark)]">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]">
              <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <span className="text-lg font-bold text-[var(--text-inverse)]">
              Budoor
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-[var(--bg-dark-hover)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-[var(--text-inverse)]" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-[var(--border-dark)]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] text-[var(--text-primary)] font-semibold text-lg">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-dark)] bg-[var(--status-success)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-[var(--text-inverse)] truncate">
                {user?.displayName || t("user.defaultName")}
              </p>
              <p className="text-sm text-[var(--text-inverse-secondary)] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Menu Items */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-inverse-secondary)] mb-3">
            {t("nav.tools") || "Outils"}
          </p>

          <Link
            href="/dashboard/settings"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-dark-hover)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[var(--text-inverse-secondary)]" />
              <span className="text-[var(--text-inverse)]">
                {t("settings.profile.title") || "Mon profil"}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--text-inverse-secondary)]" />
          </Link>

          <button
            className="flex items-center justify-between w-full p-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-dark-hover)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[var(--text-inverse-secondary)]" />
              <span className="text-[var(--text-inverse)]">
                Notifications
              </span>
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-pink)] text-xs font-medium text-[var(--text-primary)]">
              3
            </div>
          </button>

          <Link
            href="/support"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-dark-hover)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-[var(--text-inverse-secondary)]" />
              <span className="text-[var(--text-inverse)]">
                {t("landing.footer.support") || "Aide"}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--text-inverse-secondary)]" />
          </Link>
        </div>

        {/* Logout at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-dark)] safe-area-bottom">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-3 w-full p-3 rounded-[var(--radius-md)] bg-[var(--bg-dark-hover)] hover:bg-red-500/20 text-[var(--text-inverse-secondary)] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{t("nav.logout")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
