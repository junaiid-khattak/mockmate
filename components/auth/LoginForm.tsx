"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = {
  email: string;
  password: string;
};

type TouchedState = Partial<Record<keyof FormState, boolean>>;

const initialForm: FormState = { email: "", password: "" };

export function LoginForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<TouchedState>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (key: keyof FormState) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setSubmitted(true);
    if (!isValid) return;
    setLoading(true);
    const delay = Math.floor(Math.random() * 400) + 800; // 800–1200ms
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, delay);
  };

  return (
    <Card className="w-full border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <Button variant="outline" className="w-full gap-2">
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

          <div className="flex items-center justify-between text-sm">
            <div />
            <Link href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={!isValid || loading || success}>
            {loading && <Spinner className="mr-2" size="sm" />}
            {success ? "Signed in" : "Sign in"}
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Private by default. Cancel anytime.
          </p>

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100">
              You’re in. We’re reopening your last session and prepping your dashboard.
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
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

function GoogleGlyph() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white text-[12px] font-bold text-slate-900 shadow ring-1 ring-slate-200">
      G
    </span>
  );
}
