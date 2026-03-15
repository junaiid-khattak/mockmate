export type CreditSource = "subscription" | "addon_credit" | "legacy_credit" | "free_signup";

export type SubscriptionRow = {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  sessions_limit: number;
  sessions_used: number;
  cancel_at_period_end: boolean;
};

/* ------------------------------------------------------------------ */
/*  Free plan (assigned on signup)                                    */
/* ------------------------------------------------------------------ */

export const FREE_PLAN = {
  plan: "free",
  sessions: 1,
  priceCents: 0,
  description: "Try nayld.ai with a full mock interview",
  features: [
    "1 AI mock interview",
    "Standard AI Interviewer",
    "Full 10-metric performance scoring",
    "Personalized feedback report",
  ],
} as const;

export function isFreePlan(plan: string | null | undefined): boolean {
  return plan === "free";
}

/* ------------------------------------------------------------------ */
/*  Subscription plans shown on the billing/pricing pages             */
/* ------------------------------------------------------------------ */

export type SubscriptionPlanId = "essentials_monthly" | "elite_monthly";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  sessions: number;
  priceCents: number;
  perSessionCents: number;
  agentId: string;
  creditPriceCents: number | null;
  creditStripePriceEnvKey: string | null;
  isSubscriberPlan: boolean;
  description: string;
  features: string[];
  premiumCallout?: string;
  recommended?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "essentials_monthly",
    name: "Essentials",
    sessions: 10,
    priceCents: 2000,
    perSessionCents: 200,
    agentId: "standard",
    creditPriceCents: 300,
    creditStripePriceEnvKey: "STRIPE_ESSENTIALS_CREDIT_PRICE_ID",
    isSubscriberPlan: true,
    description: "Everything you need for consistent interview practice",
    features: [
      "10 AI mock interviews per month",
      "Standard AI Interviewer",
      "Full 10-metric performance scoring",
      "Personalized feedback report",
      "Buy extra interviews at $3 each",
      "Cancel anytime",
    ],
  },
  {
    id: "elite_monthly",
    name: "Elite",
    sessions: 10,
    priceCents: 6900,
    perSessionCents: 690,
    agentId: "premium",
    creditPriceCents: 1000,
    creditStripePriceEnvKey: "STRIPE_ELITE_CREDIT_PRICE_ID",
    isSubscriberPlan: true,
    description: "The most realistic AI interview experience available",
    features: [
      "10 AI mock interviews per month",
      "Premium AI Interviewer",
      "Faster, more natural responses",
      "Human-like conversation flow",
      "Deepest contextual follow-ups",
      "Full 10-metric performance scoring",
      "Personalized feedback report",
      "Buy extra interviews at $10 each",
      "Cancel anytime",
    ],
    premiumCallout:
      "The closest thing to a real interviewer — faster responses, more natural conversation, and deeper contextual follow-ups.",
    recommended: true,
  },
];

export function getSubscriptionPlan(id: SubscriptionPlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}

export function getSubscriptionPlanByPlanId(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

export function isSubscriptionPlanId(value: unknown): value is SubscriptionPlanId {
  return (
    typeof value === "string" &&
    SUBSCRIPTION_PLANS.some((p) => p.id === value)
  );
}

export function getSubscriptionPriceId(planId: SubscriptionPlanId): string {
  const envKey = `STRIPE_SUBSCRIPTION_PRICE_ID_${planId.toUpperCase()}`;
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }
  return value;
}

export function getCreditStripePriceId(plan: SubscriptionPlan): string | null {
  if (!plan.creditStripePriceEnvKey) return null;
  return process.env[plan.creditStripePriceEnvKey] ?? null;
}

type SubscriptionSupabaseClient = {
  rpc: (
    fn: "get_active_subscription" | "increment_subscription_sessions_used" | "create_free_subscription" | "cancel_free_subscription",
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

export async function getActiveSubscription(
  supabase: SubscriptionSupabaseClient,
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase.rpc("get_active_subscription", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Failed to fetch active subscription", error);
    return null;
  }

  // RPC returns a set — Supabase wraps single-row RETURNS TABLE as array
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const r = row as Record<string, unknown>;
  if (!r.id || !r.stripe_subscription_id) return null;

  return {
    id: String(r.id),
    stripe_subscription_id: String(r.stripe_subscription_id),
    stripe_customer_id: String(r.stripe_customer_id),
    plan: String(r.plan),
    status: String(r.status),
    current_period_start: String(r.current_period_start),
    current_period_end: String(r.current_period_end),
    sessions_limit: Number(r.sessions_limit),
    sessions_used: Number(r.sessions_used),
    cancel_at_period_end: Boolean(r.cancel_at_period_end),
  };
}

export async function incrementSubscriptionSession(
  supabase: SubscriptionSupabaseClient,
  subscriptionId: string,
  interviewId: string,
): Promise<{ ok: boolean }> {
  const { data, error } = await supabase.rpc(
    "increment_subscription_sessions_used",
    {
      p_subscription_id: subscriptionId,
      p_interview_id: interviewId,
    },
  );

  if (error) {
    console.error("Failed to increment subscription session", error);
    return { ok: false };
  }

  // RPC returns a single boolean
  const result = typeof data === "boolean" ? data : false;
  return { ok: result };
}

export function hasSessionsRemaining(sub: SubscriptionRow): boolean {
  return sub.sessions_used < sub.sessions_limit;
}

export async function createFreeSubscription(
  supabase: SubscriptionSupabaseClient,
  userId: string,
): Promise<{ ok: boolean }> {
  const { data, error } = await supabase.rpc("create_free_subscription", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Failed to create free subscription", error);
    return { ok: false };
  }

  return { ok: typeof data === "boolean" ? data : false };
}

export async function cancelFreeSubscription(
  supabase: SubscriptionSupabaseClient,
  userId: string,
): Promise<{ ok: boolean }> {
  const { data, error } = await supabase.rpc("cancel_free_subscription", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Failed to cancel free subscription", error);
    return { ok: false };
  }

  return { ok: typeof data === "boolean" ? data : false };
}
