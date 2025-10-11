import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../utils/cn.ts";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, children, ...rest }: CardProps) => (
  <div
    className={cn("rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl", className)}
    {...rest}
  >
    {children}
  </div>
);

interface CardHeaderProps extends PropsWithChildren {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader = ({
  title,
  description,
  className,
  action,
}: CardHeaderProps) => (
  <div className={cn("mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", className)}>
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? (
        <p className="text-sm text-slate-300/80">{description}</p>
      ) : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

interface CardContentProps extends PropsWithChildren {
  className?: string;
}

export const CardContent = ({ className, children }: CardContentProps) => (
  <div className={cn("space-y-3", className)}>{children}</div>
);
