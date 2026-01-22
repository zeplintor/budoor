import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-sm hover:bg-[var(--bg-dark-hover)]",
        primary:
          "bg-[var(--accent-pink)] text-[var(--text-inverse)] shadow-sm hover:bg-[var(--accent-pink-dark)]",
        secondary:
          "bg-[var(--accent-yellow)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--accent-yellow-dark)]",
        success:
          "bg-[var(--accent-mint)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--accent-mint-dark)]",
        destructive:
          "bg-[var(--status-error)] text-[var(--text-inverse)] shadow-sm hover:bg-red-600",
        outline:
          "border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-muted)]",
        ghost:
          "text-[var(--text-primary)] hover:bg-[var(--bg-muted)]",
        link:
          "text-[var(--accent-pink-dark)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 md:h-10 px-5 py-2",
        sm: "h-9 md:h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 md:h-10 md:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
