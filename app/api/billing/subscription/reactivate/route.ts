import { NextResponse, type NextRequest } from "next/server";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getActiveSubscription } from "@/lib/subscription";
import { apiError } from "@/lib/posthog/api-error";

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/billing/subscription/reactivate" });
  }

  const sub = await getActiveSubscription(supabase, user.id);
  if (!sub) {
    return apiError({ error: "No active subscription found.", status: 404, route: "/api/billing/subscription/reactivate", userId: user.id });
  }

  if (!sub.cancel_at_period_end) {
    return apiError({ error: "Subscription is not in a canceling state.", status: 400, route: "/api/billing/subscription/reactivate", userId: user.id });
  }

  const stripe = getStripe();

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  const serviceSupabase = createServiceRoleSupabaseClient();
  await serviceSupabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  const response = NextResponse.json({
    ok: true,
    cancel_at_period_end: false,
  });
  applyCookies(response);
  return response;
}
