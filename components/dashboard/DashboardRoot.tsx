import { ReactNode } from "react";

type DashboardRootProps = {
  children: ReactNode;
};

export function DashboardRoot({ children }: DashboardRootProps) {
  return (
    <div className="relative min-h-screen bg-mm-bg text-mm-text overflow-hidden">
      {/* Ambient top glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[600px] opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(124, 92, 252, 0.07) 0%, transparent 70%)",
        }}
      />
      {/* Secondary ambient glow — bottom right */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 h-[500px] w-[500px] opacity-100"
        style={{
          background:
            "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
