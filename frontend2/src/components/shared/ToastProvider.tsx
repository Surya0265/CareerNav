import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuid } from "uuid";

import type { ToastOptions, ToastTone, ToastContextValue } from "./ToastContext.ts";
import { ToastContext } from "./ToastContext.ts";

interface ToastEntry extends ToastOptions {
  id: string;
  createdAt: number;
}

const TONE_STYLES: Record<ToastTone, string> = {
  info: "border-blue-500/60 bg-blue-500/15 text-blue-100",
  success: "border-emerald-500/60 bg-emerald-500/15 text-emerald-100",
  warning: "border-amber-500/60 bg-amber-500/15 text-amber-100",
  error: "border-rose-500/60 bg-rose-500/15 text-rose-100",
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timeout = toast.duration ?? 4500;
      return window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, timeout);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts]);

  const push = useCallback<ToastContextValue["push"]>((toast) => {
    setToasts((current) => [
      ...current,
      {
        id: uuid(),
        createdAt: Date.now(),
        tone: toast.tone ?? "info",
        ...toast,
      },
    ]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-2 top-4 z-50 flex flex-col gap-3 md:inset-x-auto md:right-6 md:w-80">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${TONE_STYLES[toast.tone ?? "info"]}`}
            >
              <p className="text-sm font-semibold tracking-wide">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs text-slate-200/90">{toast.description}</p>
              ) : null}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
