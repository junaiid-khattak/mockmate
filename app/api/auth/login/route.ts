import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils";

type LoginPayload = {
  email: string;
  password: string;
};

function isEmailNotConfirmed(message?: string, code?: string | null) {
  const lowered = (message ?? "").toLowerCase();
  return code === "email_not_confirmed" || lowered.includes("email not confirmed");
}

export async function POST(request: NextRequest) {
  let payload: LoginPayload | null = null;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = isEmailNotConfirmed(error.message, (error as { code?: string }).code ?? null)
      ? "Please confirm your email before signing in."
      : "Invalid email or password.";
    const response = NextResponse.json({ ok: false, error: message }, { status: 400 });
    applyCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  applyCookies(response);
  return response;
}
