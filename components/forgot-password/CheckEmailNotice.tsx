"use client";

import Link from "next/link";

type CheckEmailNoticeProps = {
  email: string;
};

export function CheckEmailNotice({ email }: CheckEmailNoticeProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Check your email</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          If an account exists for{" "}
          <span className="font-medium text-slate-900 dark:text-white">{email}</span>, you’ll receive a
          reset link shortly.
        </p>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">
        <Link href="/login" className="text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
