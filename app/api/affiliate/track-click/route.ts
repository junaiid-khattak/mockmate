import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

// Simple in-memory rate limit (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  let body: {
    referral_code?: string;
    landing_page?: string;
    referrer_url?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = String(body.referral_code ?? "").toUpperCase().trim();
  if (!code) return NextResponse.json({ ok: true });

  const supabase = createServiceRoleSupabaseClient();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("referral_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!affiliate) return NextResponse.json({ ok: true });

  const userAgent = request.headers.get("user-agent") ?? "";

  // Deduplication: skip if same IP within 1 hour
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await supabase
    .from("referral_clicks")
    .select("id", { count: "exact", head: true })
    .eq("affiliate_id", affiliate.id)
    .gte("created_at", oneHourAgo)
    .eq("ip_address", ip);

  if ((count ?? 0) > 0) return NextResponse.json({ ok: true });

  await supabase.from("referral_clicks").insert({
    affiliate_id: affiliate.id,
    ip_address: ip,
    user_agent: userAgent,
    referrer_url: body.referrer_url ?? null,
    landing_page: body.landing_page ?? null,
  });

  await supabase.rpc("increment_affiliate_clicks" as never, {
    p_affiliate_id: affiliate.id,
  } as never);

  return NextResponse.json({ ok: true });
}
