import { NextResponse, type NextRequest } from "next/server";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/supabase/app-url";
import {
  getActiveSubscription,
  getSubscriptionPriceId,
  isSubscriptionPlanId,
  getSubscriptionPlan,
} from "@/lib/subscription";

export async function POST(request: NextRequest) {
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

  // Parse plan_id from request body
  const body = await request.json().catch(() => ({}));
  const planId = body?.plan_id;

  if (!isSubscriptionPlanId(planId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid subscription plan." },
      { status: 400 },
    );
  }

  const plan = getSubscriptionPlan(planId)!;

  // Check for existing active subscription (free plan is allowed to upgrade)
  const existingSub = await getActiveSubscription(supabase, user.id);
  if (existingSub && existingSub.plan !== "free") {
    return NextResponse.json(
      { ok: false, error: "You already have an active subscription." },
      { status: 409 },
    );
  }

  const stripe = getStripe();
  const serviceSupabase = createServiceRoleSupabaseClient();

  // Get or create Stripe customer (same pattern as checkout/route.ts)
  let stripeCustomerId: string;

  const { data: existing } = await serviceSupabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    stripeCustomerId = existing.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    stripeCustomerId = customer.id;

    await serviceSupabase.from("stripe_customers").upsert(
      { user_id: user.id, stripe_customer_id: stripeCustomerId },
      { onConflict: "user_id" },
    );
  }

  // Create Checkout Session in subscription mode
  const appUrl = getAppUrl(request);
  const priceId = getSubscriptionPriceId(planId);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan: planId,
        sessions_limit: String(plan.sessions),
      },
    },
    success_url: `${appUrl}/settings/billing?subscription=success`,
    cancel_url: `${appUrl}/settings/billing?subscription=cancelled`,
    allow_promotion_codes: true,
    payment_method_types: ["card"],
  });

  const response = NextResponse.json({
    ok: true,
    checkout_url: session.url,
  });
  applyCookies(response);
  return response;
}
