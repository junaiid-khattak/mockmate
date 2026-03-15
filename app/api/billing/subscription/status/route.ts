import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { getActiveSubscription, getSubscriptionPlanByPlanId } from "@/lib/subscription";
import { getInterviewCreditBalance, getAddonCreditBalance } from "@/lib/interview-paywall";

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

  const sub = await getActiveSubscription(supabase, user.id);
  const balanceResult = await getInterviewCreditBalance(supabase, user.id);
  const legacyCredits = balanceResult.ok ? balanceResult.balance : 0;

  const plan = sub ? getSubscriptionPlanByPlanId(sub.plan) : null;
  const isPaidSub = !!sub && sub.plan !== "free";

  let addonCredits = 0;
  if (sub && plan?.agentId) {
    addonCredits = await getAddonCreditBalance(supabase, user.id, plan.agentId);
  }

  const response = NextResponse.json({
    ok: true,
    has_subscription: !!sub,
    status: sub?.status ?? null,
    plan: sub?.plan ?? null,
    sessions_used: sub?.sessions_used ?? 0,
    sessions_limit: sub?.sessions_limit ?? 0,
    current_period_end: sub?.current_period_end ?? null,
    cancel_at_period_end: sub?.cancel_at_period_end ?? false,
    legacy_credits: legacyCredits,
    addon_credits: addonCredits,
    addon_credit_price_cents: plan?.creditPriceCents ?? null,
    can_buy_credits: isPaidSub,
  });
  applyCookies(response);
  return response;
}
