import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getCreditPack, isCreditPackId } from "@/lib/billing";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

type SupabaseServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

async function handleSubscriptionCheckout(
  supabase: SupabaseServiceClient,
  stripe: ReturnType<typeof getStripe>,
  session: Stripe.Checkout.Session,
): Promise<NextResponse> {
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    console.error("Subscription checkout missing subscription ID", session.id);
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Get user_id from session metadata or subscription metadata
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.error("Subscription checkout missing supabase_user_id", session.id);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const stripeSub: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? "";

  // Cancel any existing free subscription before creating paid one
  await supabase.rpc("cancel_free_subscription", { p_user_id: userId });

  // In Stripe v20, period dates are on subscription items, not the subscription itself
  const firstItem = stripeSub.items.data[0];
  const periodStart = firstItem?.current_period_start ?? Math.floor(Date.now() / 1000);
  const periodEnd = firstItem?.current_period_end ?? Math.floor(Date.now() / 1000 + 30 * 86400);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan: stripeSub.metadata?.plan ?? "pro_monthly",
      status: "active",
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      sessions_limit: Number(stripeSub.metadata?.sessions_limit) || 4,
      sessions_used: 0,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    console.error("Failed to create subscription row", subscriptionId, error);
    return NextResponse.json({ error: "Subscription creation failed" }, { status: 500 });
  }

  console.log("Subscription created", { subscriptionId, userId });
  return NextResponse.json({ ok: true });
}

async function grantCreditsForCheckoutSession(
  supabase: SupabaseServiceClient,
  session: Stripe.Checkout.Session,
): Promise<NextResponse> {
  if (session.mode !== "payment") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.error(
      "checkout session missing supabase_user_id",
      session.id,
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  const packId = session.metadata?.pack_id;
  if (!packId || !isCreditPackId(packId)) {
    console.error(
      "checkout session: missing or invalid pack_id in session metadata",
      { sessionId: session.id, packId },
    );
    return NextResponse.json(
      { ok: false, error: "Could not resolve pack_id" },
      { status: 400 },
    );
  }

  const pack = getCreditPack(packId);
  if (!pack) {
    console.error(
      "checkout session: unknown credit pack",
      { sessionId: session.id, packId },
    );
    return NextResponse.json(
      { ok: false, error: "Unknown credit pack" },
      { status: 400 },
    );
  }

  const credits = pack.credits;

  // Grant credits (idempotent via grant_key)
  const grantKey = `stripe_checkout_${session.id}`;
  const { error } = await supabase.rpc("grant_interview_credits", {
    p_user_id: userId,
    p_grant_key: grantKey,
    p_source: "one_off_purchase",
    p_credits: credits,
    p_provider: "stripe",
    p_metadata: {
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      pack_id: session.metadata?.pack_id ?? null,
    },
    p_expires_at: null,
  });

  if (error) {
    console.error(
      "Failed to grant credits for checkout session",
      session.id,
      error,
    );
    return NextResponse.json({ error: "Grant failed" }, { status: 500 });
  }

  console.log("Granted credits for checkout session", {
    sessionId: session.id,
    userId,
    credits,
  });

  // Record referral conversion if this user was referred by an affiliate
  try {
    const { data: signup } = await supabase
      .from("referral_signups")
      .select("id, affiliate_id, affiliates!inner(commission_rate)")
      .eq("referred_user_id", userId)
      .maybeSingle();

    if (signup) {
      const commissionRate = (signup.affiliates as unknown as { commission_rate: number }).commission_rate;
      const purchaseAmount = (session.amount_total ?? 0) / 100;
      const commissionAmount = parseFloat((purchaseAmount * commissionRate / 100).toFixed(2));

      await supabase.from("referral_conversions").insert({
        affiliate_id: signup.affiliate_id,
        referred_user_id: userId,
        referral_signup_id: signup.id,
        credit_pack: packId,
        purchase_amount: purchaseAmount,
        stripe_payment_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        commission_status: "pending",
      });

      await (supabase.rpc as Function)("increment_affiliate_conversion_stats", {
        p_affiliate_id: signup.affiliate_id,
        p_purchase_amount: purchaseAmount,
        p_commission_amount: commissionAmount,
      });
    }
  } catch {
    console.warn("Referral conversion tracking failed for session", session.id);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const rawBody = Buffer.from(await request.arrayBuffer());
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  // Handle synchronous payments (card, link) and subscription checkouts
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Subscription checkout — create subscription row
    if (session.mode === "subscription") {
      return handleSubscriptionCheckout(supabase, stripe, session);
    }

    // Credit pack payment checkout
    if (session.payment_status === "paid") {
      return grantCreditsForCheckoutSession(supabase, session);
    }

    // Async payment methods (Klarna, CashApp) fire with payment_status "unpaid"
    // — credits will be granted when checkout.session.async_payment_succeeded arrives
    return NextResponse.json({ ok: true, skipped: true, reason: "async_payment_pending" });
  }

  // Handle async payment methods (Klarna, CashApp, etc.)
  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    return grantCreditsForCheckoutSession(supabase, session);
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.warn("Async payment failed for checkout session", {
      sessionId: session.id,
      userId: session.metadata?.supabase_user_id,
      packId: session.metadata?.pack_id,
    });
    return NextResponse.json({ ok: true });
  }

  // ---------------------------------------------------------------
  // Subscription lifecycle events
  // ---------------------------------------------------------------

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    // Skip initial creation — already handled by checkout.session.completed
    if (invoice.billing_reason === "subscription_create") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const invoiceSub = invoice.parent?.subscription_details?.subscription;
    const stripeSubId =
      typeof invoiceSub === "string"
        ? invoiceSub
        : invoiceSub?.id;

    if (!stripeSubId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const stripeSub: Stripe.Subscription = await stripe.subscriptions.retrieve(stripeSubId);
    const renewedItem = stripeSub.items.data[0];
    const renewStart = renewedItem?.current_period_start ?? Math.floor(Date.now() / 1000);
    const renewEnd = renewedItem?.current_period_end ?? Math.floor(Date.now() / 1000 + 30 * 86400);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        sessions_used: 0,
        current_period_start: new Date(renewStart * 1000).toISOString(),
        current_period_end: new Date(renewEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", stripeSubId);

    if (error) {
      console.error("invoice.paid: failed to reset subscription", stripeSubId, error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log("Subscription renewed, sessions reset", { stripeSubId });
    return NextResponse.json({ ok: true });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const failedSub = invoice.parent?.subscription_details?.subscription;
    const stripeSubId =
      typeof failedSub === "string"
        ? failedSub
        : failedSub?.id;

    if (stripeSubId) {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", stripeSubId);

      console.log("Subscription marked past_due", { stripeSubId });
    }
    return NextResponse.json({ ok: true });
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const updatedItem = subscription.items.data[0];
    const updatedStart = updatedItem?.current_period_start ?? Math.floor(Date.now() / 1000);
    const updatedEnd = updatedItem?.current_period_end ?? Math.floor(Date.now() / 1000 + 30 * 86400);

    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(updatedStart * 1000).toISOString(),
        current_period_end: new Date(updatedEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    console.log("Subscription updated", {
      stripeSubId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
    return NextResponse.json({ ok: true });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    console.log("Subscription canceled", { stripeSubId: subscription.id });
    return NextResponse.json({ ok: true });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;

    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Find the original grant by payment intent in metadata
    const { data: grants } = await supabase
      .from("interview_credit_grants")
      .select("id, user_id, credits, grant_key")
      .eq("provider", "stripe")
      .filter("metadata->>stripe_payment_intent_id", "eq", paymentIntentId)
      .limit(1);

    const originalGrant = grants?.[0];
    if (!originalGrant) {
      console.warn(
        "charge.refunded: no matching grant found for payment_intent",
        paymentIntentId,
      );
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Negate the original credits (full refund)
    const refundCredits = -Math.abs(originalGrant.credits);
    const refundGrantKey = `stripe_refund_${charge.id}`;

    const { error } = await supabase.rpc("grant_interview_credits", {
      p_user_id: originalGrant.user_id,
      p_grant_key: refundGrantKey,
      p_source: "stripe_refund",
      p_credits: refundCredits,
      p_provider: "stripe",
      p_metadata: {
        stripe_charge_id: charge.id,
        stripe_payment_intent_id: paymentIntentId,
        original_grant_id: originalGrant.id,
      },
      p_expires_at: null,
    });

    if (error) {
      console.error("Failed to process refund for charge", charge.id, error);
      return NextResponse.json(
        { error: "Refund grant failed" },
        { status: 500 },
      );
    }

    console.log("Processed refund for charge", {
      chargeId: charge.id,
      userId: originalGrant.user_id,
      refundCredits,
    });
  }

  return NextResponse.json({ ok: true });
}
