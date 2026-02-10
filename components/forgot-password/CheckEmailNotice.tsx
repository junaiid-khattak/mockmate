"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

type CheckEmailNoticeProps = {
  email: string;
};

export function CheckEmailNotice({ email }: CheckEmailNoticeProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Check your email</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          If an account exists for{" "}
          <span className="font-medium text-slate-900 dark:text-white">{email}</span>, you'll receive a
          reset link shortly.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Can't find it? Check your spam or junk folder.
        </p>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">
        <Link href="/login" className="text-mm-violet hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
