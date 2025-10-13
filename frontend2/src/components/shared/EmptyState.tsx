import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../utils/cn.ts";

interface EmptyStateProps extends PropsWithChildren {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  title,
  description,
  icon,
  className,
  action,
  children,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-8 py-12 text-center",
      className
    )}
  >
    {icon ? <div className="text-3xl text-slate-400">{icon}</div> : null}
    <div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      ) : null}
      {children ? <div className="mt-3 text-sm text-slate-300">{children}</div> : null}
    </div>
    {action}
  </div>
);
