import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";
import { isValidEmail } from "@/lib/utils";

type ForgotPasswordPayload = {
  email: string;
};

export async function POST(request: Request) {
  let payload: ForgotPasswordPayload | null = null;

  try {
    payload = (await request.json()) as ForgotPasswordPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  const appUrl = getAppUrl(request);
  const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
