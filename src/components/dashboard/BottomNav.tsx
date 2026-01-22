"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Map, FileText, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

export function BottomNav() {
  const t = useTranslations();
  const pathname = usePathname();

  const navigation = [
    {
      name: t("nav.home"),
      href: "/dashboard",
      icon: Home,
    },
    {
      name: t("nav.parcelles"),
      href: "/dashboard/parcelles",
      icon: Map,
    },
    {
      name: t("nav.reports"),
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      name: t("nav.settings"),
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg-dark)] border-t border-[var(--border-dark)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 transition-colors",
                isActive
                  ? "text-[var(--accent-pink)]"
                  : "text-[var(--text-inverse-secondary)]"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 mb-1",
                  isActive && "text-[var(--accent-pink)]"
                )}
              />
              <span className="text-xs font-medium truncate max-w-[64px]">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
