"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { GoogleGlyph } from "@/components/ui/google-glyph";

type FieldKey = "firstName" | "lastName" | "email" | "password";

type FormState = Record<FieldKey, string>;
type TouchedState = Partial<Record<FieldKey, boolean>>;

type SignupFormProps = {
  onSubmit: (payload: FormState) => void;
  isSubmitting?: boolean;
  serverError?: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function SignupForm({ onSubmit, isSubmitting = false, serverError }: SignupFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (key: FieldKey) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true });
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            onBlur={() => handleBlur("firstName")}
            error={(touched.firstName || submitted) && errors.firstName}
            required
          />
          <Field
            id="lastName"
            label="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            onBlur={() => handleBlur("lastName")}
            error={(touched.lastName || submitted) && errors.lastName}
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
          error={(touched.email || submitted) && errors.email}
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onBlur={() => handleBlur("password")}
          error={(touched.password || submitted) && errors.password}
          hint="Minimum 8 characters."
          required
        />

        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting && <Spinner className="mr-2" size="sm" />}
          Create account
        </Button>
        {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
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
