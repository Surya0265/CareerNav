import type { PropsWithChildren } from "react";

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
    <div className="mb-8 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-blue-400">CareerNav</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">
        Sign in to track your progress and unlock tailored guidance.
      </p>
    </div>
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
      {children}
    </div>
  </div>
);
