import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../utils/cn.ts";

interface FormFieldProps extends PropsWithChildren {
  label: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  description,
  action,
  className,
  children,
}: FormFieldProps) => (
  <label className={cn("flex flex-col gap-2", className)}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {action}
    </div>
    {description ? (
      typeof description === "string" ? (
        <p className="text-xs text-slate-400">{description}</p>
      ) : (
        <div className="text-xs text-slate-400">{description}</div>
      )
    ) : null}
    {children}
  </label>
);
