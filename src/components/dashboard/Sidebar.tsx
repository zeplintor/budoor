"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Map,
  Settings,
  FileText,
  LogOut,
  Sprout,
  ChevronLeft,
  Search,
  Bell,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavigation = [
    {
      name: t("nav.home"),
      href: "/dashboard",
      icon: Home,
      tourId: "nav-home",
    },
    {
      name: t("nav.parcelles"),
      href: "/dashboard/parcelles",
      icon: Map,
      tourId: "nav-parcelles",
    },
    {
      name: t("nav.reports"),
      href: "/dashboard/reports",
      icon: FileText,
      tourId: "nav-reports",
    },
  ];

  const toolsNavigation = [
    {
      name: t("nav.settings"),
      href: "/dashboard/settings",
      icon: Settings,
      tourId: "nav-settings",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const NavItem = ({
    item,
    isActive,
  }: {
    item: (typeof mainNavigation)[0];
    isActive: boolean;
  }) => (
    <Link
      href={item.href}
      data-tour={item.tourId}
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[var(--accent-pink)] text-[var(--text-primary)]"
          : "text-[var(--text-inverse-secondary)] hover:bg-[var(--bg-dark-hover)] hover:text-[var(--text-inverse)]"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-inverse-secondary)] group-hover:text-[var(--text-inverse)]"
        )}
      />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-[var(--bg-dark)] transition-all duration-300",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]">
            <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-[var(--text-inverse)]">
              Budoor
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-inverse-secondary)] hover:bg-[var(--bg-dark-hover)] hover:text-[var(--text-inverse)] transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-dark-hover)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--text-inverse-secondary)]" />
            <input
              type="text"
              placeholder={t("common.search") || "Search..."}
              className="flex-1 bg-transparent text-sm text-[var(--text-inverse)] placeholder:text-[var(--text-inverse-secondary)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Section Label */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-inverse-secondary)]">
            {t("nav.general") || "General"}
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {mainNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return <NavItem key={item.href} item={item} isActive={isActive} />;
        })}

        {/* Tools Section */}
        {!collapsed && (
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-inverse-secondary)]">
              {t("nav.tools") || "Tools"}
            </span>
          </div>
        )}

        {toolsNavigation.map((item) => {
          const isActive = pathname === item.href;
          return <NavItem key={item.href} item={item} isActive={isActive} />;
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[var(--border-dark)] p-4">
        {/* Quick Actions */}
        {!collapsed && (
          <div className="mb-4 flex items-center justify-around">
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-inverse-secondary)] hover:bg-[var(--bg-dark-hover)] hover:text-[var(--text-inverse)] transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-inverse-secondary)] hover:bg-[var(--bg-dark-hover)] hover:text-[var(--text-inverse)] transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* User Profile */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-md)] p-2 transition-colors hover:bg-[var(--bg-dark-hover)]",
            collapsed && "justify-center"
          )}
        >
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] text-[var(--text-primary)] font-semibold">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-dark)] bg-[var(--status-success)]" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-inverse)] truncate">
                {user?.displayName || t("user.defaultName")}
              </p>
              <p className="text-xs text-[var(--text-inverse-secondary)] truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className={cn(
            "mt-3 flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--text-inverse-secondary)] hover:bg-[var(--bg-dark-hover)] hover:text-[var(--text-inverse)] transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
