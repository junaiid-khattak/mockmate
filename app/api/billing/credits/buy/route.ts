import { NextResponse, type NextRequest } from "next/server";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/supabase/app-url";
import {
  getActiveSubscription,
  getSubscriptionPlanByPlanId,
  getCreditStripePriceId,
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

  const body = await request.json().catch(() => ({}));
  const quantity = body?.quantity;

  if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { ok: false, error: "invalid_quantity", message: "Quantity must be at least 1." },
      { status: 400 },
    );
  }

  // Must have an active paid subscription
  const sub = await getActiveSubscription(supabase, user.id);
  if (!sub || sub.plan === "free") {
    return NextResponse.json(
      {
        ok: false,
        error: "subscription_required",
        message: "Subscribe to a plan before purchasing additional credits.",
      },
      { status: 403 },
    );
  }

  const plan = getSubscriptionPlanByPlanId(sub.plan);
  if (!plan || !plan.creditPriceCents) {
    return NextResponse.json(
      {
        ok: false,
        error: "credits_not_available",
        message: "Add-on credits are not available for your current plan.",
      },
      { status: 400 },
    );
  }

  const creditPriceId = getCreditStripePriceId(plan);
  if (!creditPriceId) {
    console.error("Missing credit Stripe price ID for plan", plan.id, plan.creditStripePriceEnvKey);
    return NextResponse.json(
      { ok: false, error: "Credit pricing is not configured." },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const serviceSupabase = createServiceRoleSupabaseClient();

  // Get or create Stripe customer
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

  const appUrl = getAppUrl(request);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "payment",
    line_items: [{ price: creditPriceId, quantity }],
    metadata: {
      supabase_user_id: user.id,
      type: "addon_credit",
      plan: sub.plan,
      agent_id: plan.agentId,
      quantity: String(quantity),
    },
    success_url: `${appUrl}/settings/billing?credits=success`,
    cancel_url: `${appUrl}/settings/billing?credits=cancelled`,
    payment_method_types: ["card"],
  });

  const response = NextResponse.json({
    ok: true,
    checkout_url: session.url,
  });
  applyCookies(response);
  return response;
}
