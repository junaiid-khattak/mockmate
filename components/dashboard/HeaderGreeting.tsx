"use client";

type HeaderGreetingProps = {
  firstName: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function HeaderGreeting({
  firstName,
  onLogout,
  isLoggingOut,
}: HeaderGreetingProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,12,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <span className="gradient-text text-lg font-bold tracking-tight">
          MockMate
        </span>
        <div className="flex items-center gap-5">
          <span className="text-sm text-mm-muted">{firstName}</span>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="text-sm text-mm-dim transition-colors hover:text-mm-muted disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
