"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: "" };
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 12 && hasUpper && hasNumber && hasSpecial) return { level: 3, label: "Strong" };
  if (password.length >= 8 && hasUpper && hasNumber) return { level: 2, label: "Fair" };
  if (password.length >= 8) return { level: 1, label: "Weak" };
  return { level: 0, label: "" };
}

const strengthColors = ["bg-slate-200", "bg-rose-400", "bg-amber-400", "bg-emerald-400"];

export function SignupForm({ onSubmit, isSubmitting = false, serverError }: SignupFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;
  const strength = getPasswordStrength(form.password);

  const handleBlur = (key: FieldKey) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true });
    setSubmitted(true);
    if (!isValid || isSubmitting) return;
    onSubmit(form);
  };

  return (
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
      <div>
        <Field
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onBlur={() => handleBlur("password")}
          error={(touched.password || submitted) && errors.password}
          hint="Minimum 8 characters."
          required
          rightEl={
            <button
              type="button"
              className="text-slate-500 transition hover:text-slate-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        {form.password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    strength.level >= i ? strengthColors[i] : "bg-slate-200",
                  )}
                />
              ))}
            </div>
            {strength.label && (
              <span className="text-xs text-slate-500">{strength.label}</span>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting && <Spinner className="mr-2" size="sm" />}
        Create account
      </Button>
      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {serverError}
        </div>
      ) : null}
    </form>
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
  rightEl?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-800">
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
  const next: Partial<Record<FieldKey, string>> = {};
  if (!values.firstName.trim()) next.firstName = "First name is required.";
  if (!values.lastName.trim()) next.lastName = "Last name is required.";
  if (!values.email.trim()) next.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
  if (!values.password) next.password = "Password is required.";
  else if (values.password.length < 8) next.password = "Password must be at least 8 characters.";
  return next;
}
