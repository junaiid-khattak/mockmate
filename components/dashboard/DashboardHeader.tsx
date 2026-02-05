"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, Settings, User } from "lucide-react";

type DashboardHeaderProps = {
  firstName: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function DashboardHeader({ firstName, avatarUrl, onLogout, isLoggingOut }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-10 -mx-6 border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            onClick={() => setOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="dashboard-user-menu"
            aria-label="Open user menu"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstName} avatar`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>

          {open ? (
            <div
              id="dashboard-user-menu"
              role="menu"
              className="absolute left-0 mt-2 w-40 rounded-xl border border-slate-800/80 bg-slate-900/95 p-1 shadow-xl"
            >
              <Link
                href="/settings"
                role="menuitem"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? <Spinner className="h-4 w-4" size="sm" /> : <LogOut className="h-4 w-4" />}
                Log out
              </button>
            </div>
          ) : null}
        </div>
        <span className="text-slate-300">
          Welcome, <span className="font-semibold text-slate-100">{firstName}</span>
        </span>
      </div>
    </header>
  );
}
