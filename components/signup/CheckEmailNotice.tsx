"use client";

import Link from "next/link";
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
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Confirm your email</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We sent a confirmation link to{" "}
          <span className="font-medium text-slate-900 dark:text-white">{email}</span>. Click it to
          activate your account.
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
        <Link href="/login" className="text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
