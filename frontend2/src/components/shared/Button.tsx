import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn.ts";

// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-blue-600 focus-visible:outline-blue-400",
        secondary:
          "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700 focus-visible:outline-slate-400",
        ghost: "bg-transparent text-slate-100 hover:bg-slate-800/60",
        outline:
          "border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800/40",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
