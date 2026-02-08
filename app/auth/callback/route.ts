import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/app-url";

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

  const response = NextResponse.redirect(new URL(nextPath, baseUrl));
  applyCookies(response);
  return response;
}
