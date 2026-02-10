import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BILLING_PROVIDER,
  INTERVIEW_CREDIT_UNIT_PRICE_CENTS,
  ONE_OFF_CREDIT_ORDER_PLAN_ID,
  normalizeCurrency,
  parseInteger,
} from "@/lib/billing";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

type BillingPlanRow = {
  id: string;
  active: boolean | null;
  currency: string | null;
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
const MAX_CREDIT_QUANTITY = 100;

function normalizeIdempotencyKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 120) return null;
  if (!/^[A-Za-z0-9:_-]+$/.test(trimmed)) return null;
  return trimmed;
}

function parseQuantity(value: unknown): number | null {
  const parsed = parseInteger(value);
  if (parsed == null) return null;
  if (parsed < 1 || parsed > MAX_CREDIT_QUANTITY) return null;
  return parsed;
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
  return `${BILLING_PROVIDER}:credits:${userId}:${idempotencyKey}`;
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
  const quantity = parseQuantity(body?.quantity);
  if (!quantity) {
    return NextResponse.json(
      {
        ok: false,
        error: `quantity must be an integer between 1 and ${MAX_CREDIT_QUANTITY}.`,
      },
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
  const totalAmountCents = quantity * INTERVIEW_CREDIT_UNIT_PRICE_CENTS;

  const { data: oneOffPlanData, error: oneOffPlanError } = await supabase
    .from("plans")
    .select("id,active,currency")
    .eq("id", ONE_OFF_CREDIT_ORDER_PLAN_ID)
    .maybeSingle();

  if (oneOffPlanError) {
    return NextResponse.json(
      { ok: false, error: "Unable to load one-off credit plan." },
      { status: 500 },
    );
  }

  const oneOffPlan = (oneOffPlanData as BillingPlanRow | null) ?? null;
  if (!oneOffPlan) {
    return NextResponse.json(
      {
        ok: false,
        error: `Plan \"${ONE_OFF_CREDIT_ORDER_PLAN_ID}\" is missing. Run migrations before using billing purchases.`,
      },
      { status: 500 },
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
        plan_id: ONE_OFF_CREDIT_ORDER_PLAN_ID,
        status: "paid",
        provider: BILLING_PROVIDER,
        provider_order_id: providerOrderId,
        amount_cents: totalAmountCents,
        currency: normalizeCurrency(oneOffPlan.currency),
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

  if (order.plan_id !== ONE_OFF_CREDIT_ORDER_PLAN_ID) {
    return NextResponse.json(
      { ok: false, error: "Idempotency key conflicts with another purchase." },
      { status: 409 },
    );
  }

  if (toNonNegativeInteger(order.amount_cents) !== totalAmountCents) {
    return NextResponse.json(
      {
        ok: false,
        error: "Idempotency key conflicts with a different credit quantity.",
      },
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
      p_grant_key: `one_off_purchase:${order.id}`,
      p_source: "one_off_purchase",
      p_credits: quantity,
      p_plan_id: null,
      p_order_id: order.id,
      p_provider: order.provider,
      p_metadata: {
        purchase_flow: "dashboard",
        quantity,
        unit_price_cents: INTERVIEW_CREDIT_UNIT_PRICE_CENTS,
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
    purchase: {
      quantity,
      unit_price_cents: INTERVIEW_CREDIT_UNIT_PRICE_CENTS,
      total_amount_cents: totalAmountCents,
    },
    grant_id: grantRow.grant_id,
    grant_created: grantRow.created,
    balance_after: grantRow.balance_after,
  });

  applyCookies(response);
  return response;
}
