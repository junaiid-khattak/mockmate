import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils";
import { apiError } from "@/lib/posthog/api-error";

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
    return apiError({ error: "Invalid JSON payload", status: 400, route: "/api/auth/login" });
  }

  if (!payload) {
    return apiError({ error: "Missing payload", status: 400, route: "/api/auth/login" });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (!email || !password) {
    return apiError({ error: "Email and password are required", status: 400, route: "/api/auth/login" });
  }

  if (!isValidEmail(email)) {
    return apiError({ error: "Invalid email address", status: 400, route: "/api/auth/login" });
  }

  if (password.length < 8) {
    return apiError({ error: "Password must be at least 8 characters", status: 400, route: "/api/auth/login" });
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = isEmailNotConfirmed(error.message, (error as { code?: string }).code ?? null)
      ? "Please confirm your email before signing in."
      : "Invalid email or password.";
    // Can't use apiError() here because applyCookies needs the response object
    const { getServerPostHog } = await import("@/lib/posthog/server");
    try { getServerPostHog().capture({ distinctId: "anonymous", event: "api_error", properties: { error_message: message, status_code: 400, route: "/api/auth/login" } }); } catch {}
    const response = NextResponse.json({ ok: false, error: message }, { status: 400 });
    applyCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  applyCookies(response);
  return response;
}
