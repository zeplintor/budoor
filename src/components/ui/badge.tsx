import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-xl)] px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-muted)] text-[var(--text-primary)]",
        pink:
          "bg-[var(--accent-pink-light)] text-[var(--accent-pink-dark)]",
        yellow:
          "bg-[var(--accent-yellow-light)] text-[var(--accent-yellow-dark)]",
        mint:
          "bg-[var(--accent-mint-light)] text-[var(--accent-mint-dark)]",
        purple:
          "bg-[var(--accent-purple-light)] text-[var(--accent-purple-dark)]",
        coral:
          "bg-[var(--accent-coral-light)] text-[var(--accent-coral-dark)]",
        success:
          "bg-[var(--status-success-light)] text-[var(--status-success)]",
        warning:
          "bg-[var(--status-warning-light)] text-[var(--status-warning)]",
        error:
          "bg-[var(--status-error-light)] text-[var(--status-error)]",
        info:
          "bg-[var(--status-info-light)] text-[var(--status-info)]",
        outline:
          "border border-[var(--border-light)] text-[var(--text-primary)]",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
