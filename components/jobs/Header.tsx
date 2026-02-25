"use client";

import Link from "next/link";
import { NayldLogo } from "@/components/NayldLogo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type HeaderProps = {
  firstName?: string;
  creditBalance?: number | null;
  onLogout: () => void;
  backHref?: string;
  backLabel?: string;
};

export function Header({ firstName, creditBalance, onLogout, backHref, backLabel }: HeaderProps) {
  const pathname = usePathname();
  const isBillingPage = pathname === "/settings/billing";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
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
            <Link href="/jobs">
              <NayldLogo className="h-8 w-auto" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {firstName && <span className="text-sm text-slate-400">{firstName}</span>}
          {typeof creditBalance === "number" && (
            <Link
              href="/settings/billing"
              className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-100"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
                ⚡
              </div>
              {creditBalance} credit{creditBalance !== 1 ? "s" : ""}
            </Link>
          )}
          <Link
            href="/settings/billing"
            aria-current={isBillingPage ? "page" : undefined}
            className={cn(
              "text-sm transition-colors",
              isBillingPage ? "text-slate-700" : "text-slate-400 hover:text-slate-600",
            )}
          >
            Billing
          </Link>
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
