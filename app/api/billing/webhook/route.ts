import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getCreditPack, isCreditPackId } from "@/lib/billing";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

type SupabaseServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

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

  // Handle synchronous payments (card, link)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

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
