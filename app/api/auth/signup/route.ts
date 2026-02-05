import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";
import { isValidEmail } from "@/lib/utils";

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  let payload: SignupPayload | null = null;

  try {
    payload = (await request.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });
  }

  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ ok: false, error: "All fields are required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json({ ok: false, error: "Supabase credentials missing" }, { status: 500 });
  }

  const appUrl = getAppUrl(request);
  const emailRedirectTo = `${appUrl}/auth/callback?next=/dashboard`;

  const supabase = createClient(supabaseUrl, publishableKey);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo,
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Signup failed" }, { status: 400 });
  }

  const service = createServiceRoleSupabaseClient();

  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      avatar_url: null,
      target_roles: [],
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ ok: false, error: "Failed to initialize profile" }, { status: 500 });
  }

  const { data: existingEntitlements, error: entitlementsError } = await service
    .from("entitlements")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("source", "free")
    .eq("plan_id", "free")
    .limit(1);

  if (entitlementsError) {
    return NextResponse.json({ ok: false, error: "Failed to verify entitlements" }, { status: 500 });
  }

  if (!existingEntitlements || existingEntitlements.length === 0) {
    const { error: insertEntitlementError } = await service.from("entitlements").insert({
      user_id: data.user.id,
      source: "free",
      status: "active",
      minutes_total: 5,
      minutes_used: 0,
      plan_id: "free",
    });

    if (insertEntitlementError) {
      return NextResponse.json({ ok: false, error: "Failed to create entitlement" }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    email,
    needsEmailConfirmation: true,
  });
}
