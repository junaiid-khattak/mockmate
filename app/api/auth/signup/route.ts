import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";
import { isValidEmail } from "@/lib/utils";
import { resolveGeo } from "@/lib/geo";
import { apiError } from "@/lib/posthog/api-error";

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Optional referral attribution (from localStorage cookie set by ReferralTracker)
  referralCode?: string;
  landingPage?: string;
};

export async function POST(request: Request) {
  let payload: SignupPayload | null = null;

  try {
    payload = (await request.json()) as SignupPayload;
  } catch {
    return apiError({ error: "Invalid JSON payload", status: 400, route: "/api/auth/signup" });
  }

  if (!payload) {
    return apiError({ error: "Missing payload", status: 400, route: "/api/auth/signup" });
  }

  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (!firstName || !lastName || !email || !password) {
    return apiError({ error: "All fields are required", status: 400, route: "/api/auth/signup" });
  }

  if (!isValidEmail(email)) {
    return apiError({ error: "Invalid email address", status: 400, route: "/api/auth/signup" });
  }

  if (password.length < 8) {
    return apiError({ error: "Password must be at least 8 characters", status: 400, route: "/api/auth/signup" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return apiError({ error: "Supabase credentials missing", status: 500, route: "/api/auth/signup" });
  }

  const appUrl = getAppUrl(request);
  const emailRedirectTo = `${appUrl}/auth/callback?next=/jobs`;

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo,
    },
  });

  if (error) {
    return apiError({ error: error.message, status: 400, route: "/api/auth/signup", cause: error });
  }

  if (!data.user) {
    return apiError({ error: "Signup failed", status: 400, route: "/api/auth/signup" });
  }

  const service = await createServiceRoleSupabaseClient();

  const geo = await resolveGeo(request);

  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      avatar_url: null,
      target_roles: [],
      ...(geo && {
        country_code: geo.country_code,
        country_name: geo.country_name,
        city: geo.city,
        region: geo.region,
      }),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return apiError({ error: "Failed to initialize profile", status: 500, route: "/api/auth/signup", userId: data.user.id, cause: profileError });
  }

  // Create free subscription for new users (idempotent — RPC checks for existing sub)
  try {
    await service.rpc("create_free_subscription", {
      p_user_id: data.user.id,
    });
  } catch {
    console.warn("Free subscription creation failed for user:", data.user.id);
  }

  // Referral attribution: record which affiliate referred this signup
  const refCode = String(payload.referralCode ?? "").toUpperCase().trim();
  if (refCode) {
    try {
      const { data: affiliate } = await service
        .from("affiliates")
        .select("id")
        .eq("referral_code", refCode)
        .eq("status", "active")
        .maybeSingle();

      if (affiliate) {
        // Insert referral_signup (ignore if user already attributed to another affiliate)
        await service
          .from("referral_signups")
          .upsert(
            {
              affiliate_id: affiliate.id,
              referred_user_id: data.user.id,
              referral_code_used: refCode,
              landing_page: payload.landingPage ?? null,
            },
            { onConflict: "referred_user_id", ignoreDuplicates: true }
          );

        // Atomically increment total_signups
        await (service.rpc as Function)("increment_affiliate_signups", {
          p_affiliate_id: affiliate.id,
        });
      }
    } catch {
      // Non-fatal: referral attribution failure shouldn't block signup
      console.warn("Referral attribution failed for code:", refCode);
    }
  }

  return NextResponse.json({
    ok: true,
    email,
    needsEmailConfirmation: true,
  });
}
