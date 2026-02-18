import { NextResponse, type NextRequest } from "next/server";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { isCreditPackId, getStripePriceId } from "@/lib/billing";
import { getAppUrl } from "@/lib/supabase/app-url";

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
  const packId = body?.pack_id;

  if (!isCreditPackId(packId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid credit pack." },
      { status: 400 },
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

  // Create Checkout Session
  const appUrl = getAppUrl(request);
  const priceId = getStripePriceId(packId);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      supabase_user_id: user.id,
      pack_id: packId,
    },
    success_url: `${appUrl}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
  });

  const response = NextResponse.json({
    ok: true,
    checkout_url: session.url,
  });
  applyCookies(response);
  return response;
}
