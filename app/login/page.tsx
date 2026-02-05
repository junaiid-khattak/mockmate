'use client';

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-indigo-300/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800">
            MockMate
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Pick up where you left off. No stress.</p>
        </div>

        <LoginForm />

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
