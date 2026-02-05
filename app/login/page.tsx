"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/login/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [serverError] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (_: { email: string; password: string }) => {
    if (status !== "idle") return;
    setStatus("submitting");
    const delay = Math.floor(Math.random() * 400) + 800;
    timerRef.current = setTimeout(() => {
      setStatus("success");
    }, delay);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-indigo-300/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        <div className="mb-6 space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800">
            MockMate
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Pick up where you left off. No stress.</p>
        </div>

        <Card className="w-full border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <LoginForm onSubmit={handleSubmit} isSubmitting={status === "submitting"} serverError={serverError} />
            <div className="flex items-center justify-between text-sm">
              <div />
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            {status === "success" ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100">
                You’re in. We’re reopening your last session and prepping your dashboard.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
