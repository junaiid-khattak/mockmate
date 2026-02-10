import { NextResponse, type NextRequest } from "next/server";
import { BILLING_PURCHASES_COMING_SOON_MESSAGE } from "@/lib/billing";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json(
    {
      ok: false,
      error: "coming_soon",
      message: BILLING_PURCHASES_COMING_SOON_MESSAGE,
    },
    { status: 503 },
  );

  applyCookies(response);
  return response;
}
