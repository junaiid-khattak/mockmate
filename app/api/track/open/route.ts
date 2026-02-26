import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

// 1×1 transparent GIF — 43 bytes, no external dependency
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

const PIXEL_HEADERS = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const uid = searchParams.get("uid") ?? null;
  const campaign = searchParams.get("campaign") ?? "unknown";

  if (uid) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    const supabase = createServiceRoleSupabaseClient();
    await supabase.from("email_events").insert({
      user_id: uid,
      campaign,
      event_type: "open",
      ip,
      user_agent: userAgent,
    });
  }

  return new NextResponse(PIXEL, { status: 200, headers: PIXEL_HEADERS });
}
