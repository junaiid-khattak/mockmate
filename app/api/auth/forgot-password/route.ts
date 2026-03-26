import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";
import { isValidEmail } from "@/lib/utils";
import { apiError } from "@/lib/posthog/api-error";

type ForgotPasswordPayload = {
  email: string;
};

export async function POST(request: Request) {
  let payload: ForgotPasswordPayload | null = null;

  try {
    payload = (await request.json()) as ForgotPasswordPayload;
  } catch {
    return apiError({ error: "Invalid JSON payload", status: 400, route: "/api/auth/forgot-password" });
  }

  if (!payload) {
    return apiError({ error: "Missing payload", status: 400, route: "/api/auth/forgot-password" });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return apiError({ error: "Invalid email address", status: 400, route: "/api/auth/forgot-password" });
  }

  const appUrl = getAppUrl(request);
  const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return apiError({ error: error.message, status: 500, route: "/api/auth/forgot-password", cause: error });
  }

  return NextResponse.json({ ok: true });
}
