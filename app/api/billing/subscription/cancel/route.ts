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
    return apiError({ error: "Unauthorized", status: 401, route: "/api/billing/subscription/cancel" });
  }

  const sub = await getActiveSubscription(supabase, user.id);
  if (!sub) {
    return apiError({ error: "No active subscription found.", status: 404, route: "/api/billing/subscription/cancel", userId: user.id });
  }

  const stripe = getStripe();

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  const serviceSupabase = createServiceRoleSupabaseClient();
  await serviceSupabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  const response = NextResponse.json({
    ok: true,
    status: "canceling",
    access_until: sub.current_period_end,
    message: `Your subscription will remain active until ${new Date(sub.current_period_end).toLocaleDateString()}.`,
  });
  applyCookies(response);
  return response;
}
