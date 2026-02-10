"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type CheckEmailNoticeProps = {
  email: string;
  onResend: (email: string) => void;
  isResending?: boolean;
  serverError?: string;
};

export function CheckEmailNotice({
  email,
  onResend,
  isResending = false,
  serverError,
}: CheckEmailNoticeProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Confirm your email</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We sent a confirmation link to{" "}
          <span className="font-medium text-slate-900 dark:text-white">{email}</span>. Click it to
          activate your account.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Can't find it? Check your spam or junk folder.
        </p>
      </div>

      <Button
        className="w-full"
        type="button"
        onClick={() => onResend(email)}
        disabled={isResending}
      >
        {isResending ? <Spinner className="mr-2" size="sm" /> : null}
        Resend email
      </Button>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <div className="text-center text-sm text-slate-600 dark:text-slate-300">
        <Link href="/login" className="text-mm-violet hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
