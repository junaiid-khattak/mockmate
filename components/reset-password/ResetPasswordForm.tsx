"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type ResetPasswordPayload = {
  password: string;
};

type ResetPasswordFormProps = {
  onSubmit: (payload: ResetPasswordPayload) => Promise<{ ok: boolean; error?: string } | void>;
  isSubmitting?: boolean;
  serverError?: string;
};

export function ResetPasswordForm({
  onSubmit,
  isSubmitting,
  serverError,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const errors = useMemo(() => validate(password, confirmPassword), [password, confirmPassword]);
  const isValid = Object.keys(errors).length === 0;
  const submitting = isSubmitting ?? localSubmitting;
  const effectiveError = serverError ?? localError;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!isValid || submitting) return;

    setLocalSubmitting(true);
    setLocalError(undefined);

    try {
      const result = await onSubmit({ password });
      if (result && result.error) {
        setLocalError(result.error);
      }
    } catch (error) {
      const digest = (error as { digest?: string })?.digest;
      if (digest && digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      setLocalError("Unable to reset password.");
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-800 dark:text-white">
          New password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          required
          aria-invalid={!!(touched.password && errors.password)}
          aria-describedby={touched.password && errors.password ? "password-error" : undefined}
        />
        {touched.password && errors.password ? (
          <p id="password-error" className="text-xs text-rose-600">
            {errors.password}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800 dark:text-white">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
          required
          aria-invalid={!!(touched.confirm && errors.confirm)}
          aria-describedby={touched.confirm && errors.confirm ? "confirm-error" : undefined}
        />
        {touched.confirm && errors.confirm ? (
          <p id="confirm-error" className="text-xs text-rose-600">
            {errors.confirm}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || submitting}>
        {submitting ? <Spinner className="mr-2" size="sm" /> : null}
        Update password
      </Button>

      {effectiveError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-100"
        >
          {effectiveError}
        </div>
      ) : null}
    </form>
  );
}

function validate(password: string, confirmPassword: string) {
  const errors: Record<string, string> = {};
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirm = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirm = "Passwords do not match.";
  }

  return errors;
}
