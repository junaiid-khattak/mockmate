import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type GrantRpcRow = {
  ok: boolean;
  grant_id: string | null;
  created: boolean;
  balance_after: number | null;
};

function readBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.trim().split(/\s+/, 2);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

function secureEquals(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

function parseRow(data: unknown): GrantRpcRow | null {
  const row =
    Array.isArray(data) && data.length > 0
      ? data[0]
      : data && typeof data === "object"
        ? data
        : null;
  if (!row || typeof row !== "object") return null;

  const asRecord = row as Record<string, unknown>;
  if (
    typeof asRecord.ok !== "boolean" ||
    typeof asRecord.created !== "boolean"
  ) {
    return null;
  }

  const grantId =
    typeof asRecord.grant_id === "string" ? asRecord.grant_id : null;
  let balanceAfter: number | null = null;
  if (
    typeof asRecord.balance_after === "number" &&
    Number.isFinite(asRecord.balance_after)
  ) {
    balanceAfter = Math.floor(asRecord.balance_after);
  } else if (
    typeof asRecord.balance_after === "string" &&
    asRecord.balance_after.trim()
  ) {
    const parsed = Number(asRecord.balance_after);
    if (Number.isFinite(parsed)) {
      balanceAfter = Math.floor(parsed);
    }
  }

  return {
    ok: asRecord.ok,
    grant_id: grantId,
    created: asRecord.created,
    balance_after: balanceAfter,
  };
}

async function createInternalSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return createServiceRoleSupabaseClient();
}

export async function POST(request: NextRequest) {
  const billingSecret =
    process.env.BILLING_INTERNAL_SECRET ?? process.env.INTERVIEW_EXCHANGE_SECRET;
  if (!billingSecret) {
    return NextResponse.json(
      { ok: false, error: "Billing grant endpoint is not configured." },
      { status: 500 },
    );
  }

  const bearer = readBearerToken(request.headers.get("authorization"));
  if (!bearer || !secureEquals(bearer, billingSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  const grantKey =
    typeof body?.grant_key === "string" ? body.grant_key.trim() : "";
  const sourceRaw = typeof body?.source === "string" ? body.source.trim() : "";
  const source =
    sourceRaw === "subscription_cycle" ||
    sourceRaw === "one_off_purchase" ||
    sourceRaw === "manual_adjustment"
      ? sourceRaw
      : "";
  const credits = Number(body?.credits);
  const planId = typeof body?.plan_id === "string" ? body.plan_id.trim() : null;
  const orderId =
    typeof body?.order_id === "string" ? body.order_id.trim() : null;
  const provider =
    typeof body?.provider === "string" ? body.provider.trim() : null;
  const metadata =
    body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const expiresAt =
    typeof body?.expires_at === "string" && body.expires_at.trim()
      ? body.expires_at.trim()
      : null;

  if (!userId || !grantKey || !source || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid grant payload." },
      { status: 400 },
    );
  }

  const supabase = await createInternalSupabaseClient();
  const { data, error } = await supabase.rpc("grant_interview_credits", {
    p_user_id: userId,
    p_grant_key: grantKey,
    p_source: source,
    p_credits: Math.floor(credits),
    p_plan_id: planId,
    p_order_id: orderId,
    p_provider: provider,
    p_metadata: metadata,
    p_expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to grant interview credits." },
      { status: 500 },
    );
  }

  const row = parseRow(data);
  if (!row) {
    return NextResponse.json(
      { ok: false, error: "Invalid grant response." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    grant_id: row.grant_id,
    created: row.created,
    balance_after: row.balance_after,
  });
}
