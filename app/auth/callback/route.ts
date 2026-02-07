import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

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

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, request.url));
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const response = NextResponse.redirect(new URL(`/login?error=${errorParam}`, request.url));
    applyCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  applyCookies(response);
  return response;
}
