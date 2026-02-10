import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BILLING_PROVIDER,
  isPurchasableBillingPlanId,
  normalizeCurrency,
  parseInteger,
} from "@/lib/billing";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

type BillingPlanRow = {
  id: string;
  name: string;
  price_cents: number | null;
  currency: string | null;
  billing_type: string | null;
  interval: string | null;
  interview_credits_included: number | null;
  active: boolean | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  provider: string;
  provider_order_id: string | null;
  amount_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
};

type GrantRpcRow = {
  ok: boolean;
  grant_id: string | null;
  created: boolean;
  balance_after: number | null;
};

const ORDER_SELECT =
  "id,user_id,plan_id,status,provider,provider_order_id,amount_cents,currency,paid_at,created_at";

function normalizeIdempotencyKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 120) return null;
  if (!/^[A-Za-z0-9:_-]+$/.test(trimmed)) return null;
  return trimmed;
}

function parseGrantRow(data: unknown): GrantRpcRow | null {
  const row =
    Array.isArray(data) && data.length > 0
      ? data[0]
      : data && typeof data === "object"
        ? data
        : null;

  if (!row || typeof row !== "object") return null;

  const asRecord = row as Record<string, unknown>;
  if (
    typeof asRecord.ok !== "boolean" ||
    typeof asRecord.created !== "boolean"
  ) {
    return null;
  }

  return {
    ok: asRecord.ok,
    created: asRecord.created,
    grant_id: typeof asRecord.grant_id === "string" ? asRecord.grant_id : null,
    balance_after: parseInteger(asRecord.balance_after),
  };
}

function toNonNegativeInteger(value: unknown): number {
  const parsed = parseInteger(value);
  if (parsed == null) return 0;
  return Math.max(0, parsed);
}

function buildProviderOrderId(userId: string, idempotencyKey: string): string {
  return `${BILLING_PROVIDER}:subscription:${userId}:${idempotencyKey}`;
}

async function createInternalSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return createServiceRoleSupabaseClient();
}

async function loadOrderByProviderOrderId(
  supabase: ReturnType<typeof createRouteHandlerSupabaseClient>["supabase"],
  userId: string,
  providerOrderId: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .eq("provider", BILLING_PROVIDER)
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load existing order.");
  }

  return (data as OrderRow | null) ?? null;
}

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planId = typeof body?.plan_id === "string" ? body.plan_id.trim() : "";

  if (!isPurchasableBillingPlanId(planId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid subscription plan." },
      { status: 400 },
    );
  }

  const rawIdempotencyKey = body?.idempotency_key;
  const normalizedIdempotencyKey = normalizeIdempotencyKey(rawIdempotencyKey);
  if (rawIdempotencyKey != null && !normalizedIdempotencyKey) {
    return NextResponse.json(
      { ok: false, error: "Invalid idempotency key." },
      { status: 400 },
    );
  }

  const idempotencyKey = normalizedIdempotencyKey ?? randomUUID();
  const providerOrderId = buildProviderOrderId(user.id, idempotencyKey);

  const { data: planData, error: planError } = await supabase
    .from("plans")
    .select(
      "id,name,price_cents,currency,billing_type,interval,interview_credits_included,active",
    )
    .eq("id", planId)
    .eq("active", true)
    .maybeSingle();

  if (planError) {
    return NextResponse.json(
      { ok: false, error: "Unable to load plan." },
      { status: 500 },
    );
  }

  const plan = (planData as BillingPlanRow | null) ?? null;
  if (!plan || plan.billing_type !== "recurring") {
    return NextResponse.json(
      { ok: false, error: "Selected plan is not purchasable." },
      { status: 400 },
    );
  }

  const creditsToGrant = toNonNegativeInteger(plan.interview_credits_included);
  if (creditsToGrant < 1) {
    return NextResponse.json(
      { ok: false, error: "Selected plan does not include interview credits." },
      { status: 400 },
    );
  }

  let order: OrderRow | null;
  try {
    order = await loadOrderByProviderOrderId(supabase, user.id, providerOrderId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load purchase state." },
      { status: 500 },
    );
  }

  let createdOrder = false;

  if (!order) {
    const { data: insertedOrder, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "paid",
        provider: BILLING_PROVIDER,
        provider_order_id: providerOrderId,
        amount_cents: toNonNegativeInteger(plan.price_cents),
        currency: normalizeCurrency(plan.currency),
        paid_at: new Date().toISOString(),
      })
      .select(ORDER_SELECT)
      .single();

    if (insertError) {
      const isDuplicate = insertError.code === "23505";
      if (!isDuplicate) {
        return NextResponse.json(
          { ok: false, error: "Unable to create purchase order." },
          { status: 500 },
        );
      }

      try {
        order = await loadOrderByProviderOrderId(supabase, user.id, providerOrderId);
      } catch {
        return NextResponse.json(
          { ok: false, error: "Unable to recover purchase order." },
          { status: 500 },
        );
      }
    } else {
      order = insertedOrder as OrderRow;
      createdOrder = true;
    }
  }

  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Unable to resolve purchase order." },
      { status: 500 },
    );
  }

  if (order.plan_id !== plan.id) {
    return NextResponse.json(
      { ok: false, error: "Idempotency key conflicts with another purchase." },
      { status: 409 },
    );
  }

  let serviceSupabase: Awaited<ReturnType<typeof createInternalSupabaseClient>>;
  try {
    serviceSupabase = await createInternalSupabaseClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Billing service is not configured." },
      { status: 500 },
    );
  }
  const { data: grantData, error: grantError } = await serviceSupabase.rpc(
    "grant_interview_credits",
    {
      p_user_id: user.id,
      p_grant_key: `subscription_cycle:${order.id}`,
      p_source: "subscription_cycle",
      p_credits: creditsToGrant,
      p_plan_id: plan.id,
      p_order_id: order.id,
      p_provider: order.provider,
      p_metadata: {
        purchase_flow: "dashboard",
        interval: plan.interval,
      },
      p_expires_at: null,
    },
  );

  if (grantError) {
    return NextResponse.json(
      { ok: false, error: "Unable to grant interview credits." },
      { status: 500 },
    );
  }

  const grantRow = parseGrantRow(grantData);
  if (!grantRow || !grantRow.ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid credit grant response." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      amount_cents: toNonNegativeInteger(order.amount_cents),
      currency: normalizeCurrency(order.currency),
      created_at: order.created_at,
      paid_at: order.paid_at,
      created: createdOrder,
    },
    plan: {
      id: plan.id,
      name: plan.name,
      interval: plan.interval,
      interview_credits_included: creditsToGrant,
    },
    grant_id: grantRow.grant_id,
    grant_created: grantRow.created,
    balance_after: grantRow.balance_after,
  });

  applyCookies(response);
  return response;
}
