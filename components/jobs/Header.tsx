"use client";

import Link from "next/link";

type HeaderProps = {
  firstName?: string;
  onLogout: () => void;
  backHref?: string;
  backLabel?: string;
};

export function Header({ firstName, onLogout, backHref, backLabel }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {backLabel ?? "Back"}
            </Link>
          ) : (
            <span className="text-lg font-semibold tracking-tight text-gray-900">MockMate</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {firstName && <span className="text-sm text-gray-400">{firstName}</span>}
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
