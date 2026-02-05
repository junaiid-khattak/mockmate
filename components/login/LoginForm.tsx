"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { GoogleGlyph } from "@/components/ui/google-glyph";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = {
  email: string;
  password: string;
};

type TouchedState = Partial<Record<keyof FormState, boolean>>;

const initialForm: FormState = { email: "", password: "" };

type LoginFormProps = {
  onSubmit: (payload: FormState) => void;
  isSubmitting?: boolean;
  serverError?: string;
};

export function LoginForm({ onSubmit, isSubmitting = false, serverError }: LoginFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (key: keyof FormState) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setSubmitted(true);
    if (!isValid || isSubmitting) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="outline" className="w-full gap-2" type="button">
          <GoogleGlyph />
          Continue with Google
        </Button>
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wide text-slate-400">or</span>
          <Separator className="flex-1" />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onBlur={() => handleBlur("email")}
          error={(touched.email || submitted) && errors.email}
          required
          autoComplete="email"
        />
        <Field
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onBlur={() => handleBlur("password")}
          error={(touched.password || submitted) && errors.password}
          required
          autoComplete="current-password"
          rightEl={
            <button
              type="button"
              className="text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          hint="Minimum 8 characters."
        />

        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting && <Spinner className="mr-2" size="sm" />}
          Sign in
        </Button>
        {serverError ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-100"
          >
            {serverError}
          </div>
        ) : null}
        <p className="text-xs text-slate-500 dark:text-slate-400">Private by default. Cancel anytime.</p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  error,
  hint,
  required,
  autoComplete,
  rightEl,
}: {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  type?: string;
  error?: string | false;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  rightEl?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
      </div>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(rightEl ? "pr-10" : "")}
        />
        {rightEl ? <div className="absolute inset-y-0 right-3 flex items-center">{rightEl}</div> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validate(values: FormState) {
  const next: Partial<Record<keyof FormState, string>> = {};
  if (!values.email.trim()) next.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
  if (!values.password) next.password = "Password is required.";
  else if (values.password.length < 8) next.password = "Password must be at least 8 characters.";
  return next;
}
