import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

type AccentColor = "pink" | "yellow" | "mint" | "purple" | "coral";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: AccentColor;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const accentStyles: Record<AccentColor, string> = {
  pink: "bg-[var(--accent-pink)]",
  yellow: "bg-[var(--accent-yellow)]",
  mint: "bg-[var(--accent-mint)]",
  purple: "bg-[var(--accent-purple)]",
  coral: "bg-[var(--accent-coral)]",
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { className, title, value, icon: Icon, accent = "pink", trend, subtitle, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]",
          className
        )}
        {...props}
      >
        {/* Accent indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 h-1 w-full",
            accentStyles[accent]
          )}
        />

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-[var(--radius-xl)] px-2 py-0.5 text-xs font-medium",
                    trend.isPositive
                      ? "bg-[var(--status-success-light)] text-[var(--status-success)]"
                      : "bg-[var(--status-error-light)] text-[var(--status-error)]"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]",
                accentStyles[accent]
              )}
            >
              <Icon className="h-6 w-6 text-[var(--text-primary)]" />
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
export type { StatCardProps, AccentColor };
