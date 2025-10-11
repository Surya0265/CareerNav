import type { PropsWithChildren } from "react";
import { cn } from "../../utils/cn.ts";

interface BadgeProps extends PropsWithChildren {
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-slate-800/70 text-slate-200",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  danger: "bg-rose-500/15 text-rose-300",
};

export const Badge = ({ tone = "default", className, children }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      toneStyles[tone],
      className
    )}
  >
    {children}
  </span>
);
