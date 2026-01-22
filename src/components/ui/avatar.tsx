import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusStyles = {
  online: "bg-[var(--status-success)]",
  offline: "bg-[var(--text-muted)]",
  busy: "bg-[var(--status-error)]",
  away: "bg-[var(--status-warning)]",
};

const statusSizes = {
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-4 w-4 border-2",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    return (
      <div ref={ref} className={cn("relative inline-block", className)} {...props}>
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] font-semibold text-[var(--text-primary)] overflow-hidden",
            sizeStyles[size]
          )}
        >
          {src && !imageError ? (
            <img
              src={src}
              alt={alt || "Avatar"}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{fallback?.charAt(0).toUpperCase() || "?"}</span>
          )}
        </div>
        {status && (
          <div
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-[var(--bg-secondary)]",
              statusStyles[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const overlapStyles = {
  sm: "-ml-2",
  md: "-ml-3",
  lg: "-ml-4",
};

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = "md", children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = childArray.slice(0, max);
    const remainingCount = childArray.length - max;

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className={cn(
              "relative ring-2 ring-[var(--bg-secondary)] rounded-full",
              index > 0 && overlapStyles[size]
            )}
          >
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-[var(--bg-muted)] font-medium text-[var(--text-secondary)] ring-2 ring-[var(--bg-secondary)]",
              sizeStyles[size],
              overlapStyles[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps };
