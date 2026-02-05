import { ReactNode } from "react";

type DashboardRootProps = {
  children: ReactNode;
};

export function DashboardRoot({ children }: DashboardRootProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-10">
        {children}
      </div>
    </div>
  );
}
