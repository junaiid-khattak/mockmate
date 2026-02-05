"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type FormState = { email: string };
type Touched = Partial<Record<keyof FormState, boolean>>;

const initialForm: FormState = { email: "" };

type ForgotPasswordFormProps = {
  onSubmit: (payload: FormState) => void;
  isSubmitting?: boolean;
  serverError?: string;
};

export function ForgotPasswordForm({ onSubmit, isSubmitting = false, serverError }: ForgotPasswordFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Touched>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true });
    setSubmitted(true);
    if (!isValid || isSubmitting) return;
    onSubmit(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white">
          <label htmlFor="email">Email</label>
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ email: e.target.value })}
          onBlur={() => setTouched({ email: true })}
          required
          autoComplete="email"
          aria-invalid={!!((touched.email || submitted) && errors.email)}
          aria-describedby={(touched.email || submitted) && errors.email ? "email-error" : undefined}
        />
        {(touched.email || submitted) && errors.email ? (
          <p id="email-error" className="text-xs text-rose-600">
            {errors.email}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting && <Spinner className="mr-2" size="sm" />}
        Send reset link
      </Button>
      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      <p className="text-xs text-slate-500 dark:text-slate-400">If the email exists, you’ll receive a link shortly.</p>
    </form>
  );
}

function validate(values: FormState) {
  const next: Partial<Record<keyof FormState, string>> = {};
  if (!values.email.trim()) next.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
  return next;
}
