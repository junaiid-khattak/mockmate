import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";
import { resolveGeo } from "@/lib/geo";

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/jobs";
  }
  return nextPath;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = sanitizeNextPath(url.searchParams.get("next"));
  const isRecovery = nextPath.startsWith("/reset-password");
  const errorParam = isRecovery ? "recovery_failed" : "confirmation_failed";

  // Use the external app URL for redirects — request.url may be an internal
  // address (e.g. http://localhost:3000) on platforms like AWS Amplify.
  const baseUrl = getAppUrl(request);

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, baseUrl));
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const response = NextResponse.redirect(new URL(`/login?error=${errorParam}`, baseUrl));
    applyCookies(response);
    return response;
  }

  // Upsert profile for OAuth sign-ins (e.g. Google). ignoreDuplicates ensures
  // existing email-signup profiles are never overwritten.
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.app_metadata?.provider !== "email") {
    const service = createServiceRoleSupabaseClient();
    const meta = user.user_metadata ?? {};
    const firstName = meta.given_name ?? meta.name?.split(" ")[0] ?? "";
    const lastName = meta.family_name ?? meta.name?.split(" ").slice(1).join(" ") ?? "";
    const geo = await resolveGeo(request);
    await service.from("profiles").upsert(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        avatar_url: meta.avatar_url ?? null,
        target_roles: [],
        ...(geo && {
          country_code: geo.country_code,
          country_name: geo.country_name,
          city: geo.city,
          region: geo.region,
        }),
      },
      { onConflict: "id" },
    );
  }

  const response = NextResponse.redirect(new URL(nextPath, baseUrl));
  applyCookies(response);
  return response;
}
