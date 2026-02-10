import { NextResponse, type NextRequest } from "next/server";
import {
  BILLING_PLAN_IDS,
  type BillingPlanId,
  isBillingPlanId,
  normalizeCurrency,
  parseInteger,
} from "@/lib/billing";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

type BillingPlanRow = {
  id: string;
  name: string | null;
  price_cents: number | null;
  currency: string | null;
  interval: string | null;
  interview_credits_included: number | null;
  active: boolean | null;
};

type BillingPlan = {
  id: BillingPlanId;
  name: string;
  price_cents: number;
  currency: string;
  interval: string | null;
  interview_credits_included: number;
  active: boolean;
};

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

function toNonNegativeInteger(value: unknown): number {
  const parsed = parseInteger(value);
  if (parsed == null) return 0;
  return Math.max(0, parsed);
}

function normalizePlan(row: BillingPlanRow): BillingPlan | null {
  if (!isBillingPlanId(row.id)) return null;

  return {
    id: row.id,
    name: row.name?.trim() || row.id,
    price_cents: toNonNegativeInteger(row.price_cents),
    currency: normalizeCurrency(row.currency),
    interval: row.interval?.trim() || null,
    interview_credits_included: toNonNegativeInteger(row.interview_credits_included),
    active: row.active !== false,
  };
}

function fallbackFreePlan(): BillingPlan {
  return {
    id: "free",
    name: "Free",
    price_cents: 0,
    currency: "USD",
    interval: "month",
    interview_credits_included: 0,
    active: true,
  };
}

function resolveCurrentPlanId(grants: CreditGrantRow[]): BillingPlanId {
  for (const grant of grants) {
    if (grant.source !== "subscription_cycle") continue;
    if (!isBillingPlanId(grant.plan_id)) continue;
    return grant.plan_id;
  }
  return "free";
}

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const [plansResult, grantsResult, consumptionsResult, balanceResult] = await Promise.all([
    supabase
      .from("plans")
      .select("id,name,price_cents,currency,interval,interview_credits_included,active")
      .in("id", [...BILLING_PLAN_IDS])
      .eq("active", true),
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

  if (
    plansResult.error ||
    grantsResult.error ||
    consumptionsResult.error ||
    balanceResult.error
  ) {
    return NextResponse.json(
      { ok: false, error: "Unable to load billing summary." },
      { status: 500 },
    );
  }

  const planMap = new Map<BillingPlanId, BillingPlan>();
  const rawPlans = (plansResult.data ?? []) as BillingPlanRow[];
  for (const row of rawPlans) {
    const normalized = normalizePlan(row);
    if (normalized) {
      planMap.set(normalized.id, normalized);
    }
  }

  if (!planMap.has("free")) {
    planMap.set("free", fallbackFreePlan());
  }

  const plans: BillingPlan[] = BILLING_PLAN_IDS.map((planId) => {
    return planMap.get(planId) ?? (planId === "free" ? fallbackFreePlan() : {
      id: planId,
      name: planId,
      price_cents: 0,
      currency: "USD",
      interval: "month",
      interview_credits_included: 0,
      active: false,
    });
  });

  const grants = (grantsResult.data ?? []) as CreditGrantRow[];
  const consumptions = (consumptionsResult.data ?? []) as CreditConsumptionRow[];

  const grantedTotal = grants.reduce((sum, row) => sum + toNonNegativeInteger(row.credits), 0);
  const grantedBySubscription = grants
    .filter((row) => row.source === "subscription_cycle")
    .reduce((sum, row) => sum + toNonNegativeInteger(row.credits), 0);
  const grantedByPurchase = grants
    .filter((row) => row.source === "one_off_purchase")
    .reduce((sum, row) => sum + toNonNegativeInteger(row.credits), 0);
  const consumedTotal = consumptions.reduce(
    (sum, row) => sum + toNonNegativeInteger(row.credits),
    0,
  );

  const currentPlanId = resolveCurrentPlanId(grants);
  const currentPlan =
    planMap.get(currentPlanId) ??
    (currentPlanId === "free" ? fallbackFreePlan() : planMap.get("free") ?? fallbackFreePlan());

  const availableCredits = Math.max(0, toNonNegativeInteger(balanceResult.data));

  const response = NextResponse.json({
    ok: true,
    summary: {
      available_credits: availableCredits,
      current_plan: currentPlan,
      plans,
      credit_totals: {
        granted_total: grantedTotal,
        granted_subscription: grantedBySubscription,
        granted_purchased: grantedByPurchase,
        consumed_total: consumedTotal,
      },
      recent_grants: grants.map((row) => ({
        id: row.id,
        source: row.source,
        plan_id: row.plan_id,
        credits: toNonNegativeInteger(row.credits),
        granted_at: row.granted_at,
        order_id: row.order_id,
        provider: row.provider,
      })),
      recent_consumptions: consumptions.map((row) => ({
        id: row.id,
        interview_id: row.interview_id,
        credits: toNonNegativeInteger(row.credits),
        reason: row.reason,
        consumed_at: row.consumed_at,
      })),
    },
  });

  applyCookies(response);
  return response;
}
