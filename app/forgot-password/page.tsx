"use client";

import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ForgotPasswordForm } from "@/components/forgot-password/ForgotPasswordForm";
import { CheckEmailNotice } from "@/components/forgot-password/CheckEmailNotice";
import { Card, CardContent } from "@/components/ui/card";
import { NayldLogo } from "@/components/NayldLogo";

type ForgotPasswordPayload = {
  email: string;
};

export default function Page() {
  const posthog = usePostHog();
  const [step, setStep] = useState<"form" | "check_email">("form");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  const handleSubmit = async (payload: ForgotPasswordPayload) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(undefined);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        const msg = data?.error ?? "Unable to send reset email.";
        setServerError(msg);
        posthog.capture("client_error", { error_message: msg, page: "/forgot-password" });
        return;
      }

      setEmail(payload.email);
      setStep("check_email");
    } catch (err) {
      setServerError("Unable to send reset email.");
      posthog.capture("client_error", { error_message: "Unable to send reset email.", page: "/forgot-password", cause: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-mm-violet/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        {step === "form" ? (
          <div className="mb-6 space-y-2 text-center">
            <NayldLogo className="h-10 w-auto" />
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Enter your email and we’ll send a reset link.</p>
          </div>
        ) : null}

        <Card className="w-full border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="space-y-6 p-6 sm:p-8">
            {step === "form" ? (
              <>
                <ForgotPasswordForm onSubmit={handleSubmit} isSubmitting={isSubmitting} serverError={serverError} />
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <Link href="/login" className="text-mm-violet hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </>
            ) : (
              <CheckEmailNotice email={email} />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-mm-violet hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
