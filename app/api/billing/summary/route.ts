import { NextResponse, type NextRequest } from "next/server";
import { parseInteger } from "@/lib/billing";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

type CreditGrantRow = {
  id: string;
  source: string;
  plan_id: string | null;
  credits: number | null;
  granted_at: string;
  order_id: string | null;
  provider: string | null;
};

type CreditConsumptionRow = {
  id: string;
  interview_id: string;
  credits: number | null;
  reason: string | null;
  consumed_at: string;
};

function toInteger(value: unknown): number {
  const parsed = parseInteger(value);
  return parsed ?? 0;
}

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const [grantsResult, consumptionsResult, balanceResult] = await Promise.all([
    supabase
      .from("interview_credit_grants")
      .select("id,source,plan_id,credits,granted_at,order_id,provider")
      .eq("user_id", user.id)
      .order("granted_at", { ascending: false })
      .limit(25),
    supabase
      .from("interview_credit_consumptions")
      .select("id,interview_id,credits,reason,consumed_at")
      .eq("user_id", user.id)
      .order("consumed_at", { ascending: false })
      .limit(25),
    supabase.rpc("get_interview_credit_balance", { p_user_id: user.id }),
  ]);

  if (grantsResult.error || consumptionsResult.error || balanceResult.error) {
    return NextResponse.json(
      { ok: false, error: "Unable to load billing summary." },
      { status: 500 },
    );
  }

  const grants = (grantsResult.data ?? []) as CreditGrantRow[];
  const consumptions = (consumptionsResult.data ?? []) as CreditConsumptionRow[];

  const grantedPurchased = grants
    .filter((r) => r.source === "one_off_purchase")
    .reduce((sum, r) => sum + Math.max(0, toInteger(r.credits)), 0);
  const refundedTotal = grants
    .filter((r) => r.source === "stripe_refund")
    .reduce((sum, r) => sum + Math.abs(toInteger(r.credits)), 0);
  const consumedTotal = consumptions.reduce(
    (sum, r) => sum + Math.max(0, toInteger(r.credits)),
    0,
  );

  const availableCredits = Math.max(0, toInteger(balanceResult.data));

  const response = NextResponse.json({
    ok: true,
    summary: {
      available_credits: availableCredits,
      credit_totals: {
        granted_purchased: grantedPurchased,
        refunded_total: refundedTotal,
        consumed_total: consumedTotal,
      },
      recent_grants: grants.map((row) => ({
        id: row.id,
        source: row.source,
        plan_id: row.plan_id,
        credits: toInteger(row.credits),
        granted_at: row.granted_at,
        order_id: row.order_id,
        provider: row.provider,
      })),
      recent_consumptions: consumptions.map((row) => ({
        id: row.id,
        interview_id: row.interview_id,
        credits: toInteger(row.credits),
        reason: row.reason,
        consumed_at: row.consumed_at,
      })),
    },
  });

  applyCookies(response);
  return response;
}
