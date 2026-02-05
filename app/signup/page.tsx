'use client';

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

type FieldKey = "firstName" | "lastName" | "email" | "password";

type FormState = Record<FieldKey, string>;
type TouchedState = Partial<Record<FieldKey, boolean>>;

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<TouchedState>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (submitted && isValid && !loading && !success) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [submitted, isValid, loading, success]);

  const handleBlur = (key: FieldKey) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true });
    setSubmitted(true);
    if (!isValid) return;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-indigo-300/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800">
            MockMate
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">No credit card. Start in under a minute.</p>
        </div>

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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  onBlur={() => handleBlur("firstName")}
                  error={touched.firstName && errors.firstName}
                  required
                />
                <Field
                  id="lastName"
                  label="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  onBlur={() => handleBlur("lastName")}
                  error={touched.lastName && errors.lastName}
                  required
                />
              </div>
              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                error={touched.email && errors.email}
                required
              />
              <Field
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onBlur={() => handleBlur("password")}
                error={touched.password && errors.password}
                hint="Minimum 8 characters."
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || loading || success}
              >
                {loading && <Spinner className="mr-2" size="sm" />}
                {success ? "Account created" : "Create account"}
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By continuing, you agree to the{" "}
                <Link href="/legal/terms" className="text-indigo-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {success ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100">
                  Welcome to MockMate! We’ve started calibrating your first mock. Check your email for next steps.
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
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
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
      </div>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validate(values: FormState) {
  const next: Partial<Record<FieldKey, string>> = {};
  if (!values.firstName.trim()) next.firstName = "First name is required.";
  if (!values.lastName.trim()) next.lastName = "Last name is required.";
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
