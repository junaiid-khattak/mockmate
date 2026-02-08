"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

type HeaderProps = {
  firstName?: string;
  onLogout: () => void;
  backHref?: string;
  backLabel?: string;
};

export function Header({ firstName, onLogout, backHref, backLabel }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {backLabel ?? "Back"}
            </Link>
          ) : (
            <Link href="/jobs" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-mm-blue text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">nayld.ai</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {firstName && <span className="text-sm text-slate-400">{firstName}</span>}
          <button
            onClick={onLogout}
            className="text-sm text-slate-400 transition-colors hover:text-slate-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
