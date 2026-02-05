"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/signup/SignupForm";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverError: string | undefined = undefined;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (_: { firstName: string; lastName: string; email: string; password: string }) => {
    if (status !== "idle") return;
    setStatus("submitting");
    timerRef.current = setTimeout(() => {
      setStatus("success");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-indigo-300/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        <div className="mb-6 space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800">
            MockMate
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">No credit card. Start in under a minute.</p>
        </div>

        <Card className="w-full border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <SignupForm onSubmit={handleSubmit} isSubmitting={status === "submitting"} serverError={serverError} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              By continuing, you agree to the{" "}
              <Link href="/legal/terms" className="text-indigo-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            {status === "success" ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100">
                Welcome to MockMate! We’ve started calibrating your first mock. Check your email for next steps.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
