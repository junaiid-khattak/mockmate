export type CreditSource = "subscription" | "legacy_credit" | "free_signup";

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

export const PRO_MONTHLY_PLAN = {
  plan: "pro_monthly",
  sessionsPerPeriod: 4,
  priceCents: 2900,
} as const;

/* ------------------------------------------------------------------ */
/*  Free plan (assigned on signup)                                    */
/* ------------------------------------------------------------------ */

export const FREE_PLAN = {
  plan: "free",
  sessions: 1,
  priceCents: 0,
  features: [
    "1 interview session",
    "Full AI feedback & scoring",
    "Performance tracking",
  ],
} as const;

export function isFreePlan(plan: string | null | undefined): boolean {
  return plan === "free";
}

/* ------------------------------------------------------------------ */
/*  Subscription plans shown on the billing page                      */
/* ------------------------------------------------------------------ */

export type SubscriptionPlanId = "starter_monthly" | "pro_monthly" | "power_monthly";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  sessions: number;
  priceCents: number;
  perSessionCents: number;
  features: string[];
  recommended?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter_monthly",
    name: "Starter",
    sessions: 2,
    priceCents: 1500,
    perSessionCents: 750,
    features: [
      "2 interview sessions / month",
      "Full AI feedback & scoring",
      "Performance tracking",
    ],
  },
  {
    id: "pro_monthly",
    name: "Pro",
    sessions: 4,
    priceCents: 2500,
    perSessionCents: 625,
    features: [
      "4 interview sessions / month",
      "Full AI feedback & scoring",
      "Performance tracking",
      "Priority support",
    ],
    recommended: true,
  },
  {
    id: "power_monthly",
    name: "Power",
    sessions: 8,
    priceCents: 4000,
    perSessionCents: 500,
    features: [
      "8 interview sessions / month",
      "Full AI feedback & scoring",
      "Performance tracking",
      "Priority support",
    ],
  },
];

export function getSubscriptionPlan(id: SubscriptionPlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
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

export function getProMonthlyPriceId(): string {
  const value = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  if (!value) {
    throw new Error("Missing environment variable: STRIPE_PRO_MONTHLY_PRICE_ID");
  }
  return value;
}
