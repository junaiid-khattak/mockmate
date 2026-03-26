import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.signOut();

  if (error) {
    const { getServerPostHog } = await import("@/lib/posthog/server");
    try { getServerPostHog().capture({ distinctId: "anonymous", event: "api_error", properties: { error_message: error.message, status_code: 400, route: "/api/auth/logout" } }); } catch {}
    const response = NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    applyCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  applyCookies(response);
  return response;
}
