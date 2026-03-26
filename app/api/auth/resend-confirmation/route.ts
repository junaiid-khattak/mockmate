import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAppUrl } from "@/lib/supabase/app-url";
import { isValidEmail } from "@/lib/utils";
import { apiError } from "@/lib/posthog/api-error";

type ResendPayload = {
  email: string;
};

export async function POST(request: Request) {
  let payload: ResendPayload | null = null;

  try {
    payload = (await request.json()) as ResendPayload;
  } catch {
    return apiError({ error: "Invalid JSON payload", status: 400, route: "/api/auth/resend-confirmation" });
  }

  if (!payload) {
    return apiError({ error: "Missing payload", status: 400, route: "/api/auth/resend-confirmation" });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return apiError({ error: "Invalid email address", status: 400, route: "/api/auth/resend-confirmation" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return apiError({ error: "Supabase credentials missing", status: 500, route: "/api/auth/resend-confirmation" });
  }

  const appUrl = getAppUrl(request);
  const emailRedirectTo = `${appUrl}/auth/callback?next=/jobs`;

  const supabase = createClient(supabaseUrl, anonKey);
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return apiError({ error: error.message, status: 400, route: "/api/auth/resend-confirmation", cause: error });
  }

  return NextResponse.json({ ok: true });
}
