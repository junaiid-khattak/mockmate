"use client";

import Link from "next/link";
import Image from "next/image";
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
            <Link href="/jobs">
              <Image src="/logo.png" alt="nayld.ai" width={861} height={351} className="h-8 w-auto" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {firstName && <span className="text-sm text-slate-400">{firstName}</span>}
          {typeof creditBalance === "number" && (
            <Link
              href="/settings/billing"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-mm-violet/30 hover:text-mm-violet"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-mm-violet">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.5 8H7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
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
