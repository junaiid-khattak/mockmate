"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet, ShieldCheck, CreditCard } from "lucide-react";
import { Header } from "@/components/jobs/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  INTERVIEW_CREDIT_UNIT_PRICE_CENTS,
  type BillingPlanId,
  type PurchasableBillingPlanId,
} from "@/lib/billing";

type BillingPlan = {
  id: BillingPlanId;
  name: string;
  price_cents: number;
  currency: string;
  interval: string | null;
  interview_credits_included: number;
  active: boolean;
};

type BillingGrant = {
  id: string;
  source: string;
  plan_id: string | null;
  credits: number;
  granted_at: string;
  order_id: string | null;
  provider: string | null;
};

type BillingConsumption = {
  id: string;
  interview_id: string;
  credits: number;
  reason: string | null;
  consumed_at: string;
};

type BillingSummary = {
  available_credits: number;
  current_plan: BillingPlan;
  plans: BillingPlan[];
  credit_totals: {
    granted_total: number;
    granted_subscription: number;
    granted_purchased: number;
    consumed_total: number;
  };
  recent_grants: BillingGrant[];
  recent_consumptions: BillingConsumption[];
};

type ActionMessage = {
  kind: "success" | "error";
  text: string;
};

function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(cents: number, currency: string): string {
  const normalized = Number.isFinite(cents) ? cents : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(normalized / 100);
  } catch {
    return `$${(normalized / 100).toFixed(2)}`;
  }
}

function formatPlanPrice(plan: BillingPlan): string {
  if (plan.price_cents <= 0) {
    return "$0 / month";
  }

  const base = formatMoney(plan.price_cents, plan.currency);
  if (!plan.interval) return base;
  return `${base} / ${plan.interval}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toPurchasablePlanId(planId: BillingPlanId): PurchasableBillingPlanId | null {
  if (planId === "standard" || planId === "pro") {
    return planId;
  }
  return null;
}

export default function BillingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [planPurchasePending, setPlanPurchasePending] = useState<PurchasableBillingPlanId | null>(null);
  const [creditsPurchasePending, setCreditsPurchasePending] = useState(false);
  const [creditQuantity, setCreditQuantity] = useState("1");

  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setPageError(null);

    try {
      const res = await fetch("/api/billing/summary", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok || !body.summary) {
        throw new Error(
          typeof body?.error === "string" ? body.error : "Unable to load billing summary.",
        );
      }

      setSummary(body.summary as BillingSummary);
    } catch (err) {
      setSummary(null);
      setPageError(err instanceof Error ? err.message : "Unable to load billing summary.");
    } finally {
      setLoadingSummary(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const fallback = data.user.email?.split("@")[0] ?? "";
      const metaName = data.user.user_metadata?.first_name as string | undefined;
      setFirstName(metaName ?? fallback);
      setCheckingAuth(false);

      await loadSummary();
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadSummary, router, supabase]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const handlePurchasePlan = async (planId: PurchasableBillingPlanId) => {
    if (planPurchasePending || creditsPurchasePending) return;

    setActionMessage(null);
    setPlanPurchasePending(planId);

    try {
      const res = await fetch("/api/billing/purchase/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          idempotency_key: createIdempotencyKey("plan"),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        throw new Error(
          typeof body?.error === "string" ? body.error : "Unable to complete plan purchase.",
        );
      }

      const planName =
        body?.plan && typeof body.plan.name === "string" ? body.plan.name : "Plan";
      const creditsIncluded =
        typeof body?.plan?.interview_credits_included === "number"
          ? body.plan.interview_credits_included
          : null;

      setActionMessage({
        kind: "success",
        text:
          creditsIncluded != null
            ? `${planName} activated. ${creditsIncluded} interview credit${creditsIncluded === 1 ? "" : "s"} granted.`
            : `${planName} activated successfully.`,
      });

      await loadSummary();
    } catch (err) {
      setActionMessage({
        kind: "error",
        text:
          err instanceof Error ? err.message : "Unable to complete plan purchase.",
      });
    } finally {
      setPlanPurchasePending(null);
    }
  };

  const handlePurchaseCredits = async () => {
    if (creditsPurchasePending || planPurchasePending) return;

    const quantity = Number.parseInt(creditQuantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) {
      setActionMessage({
        kind: "error",
        text: "Enter a quantity between 1 and 100 interview credits.",
      });
      return;
    }

    setActionMessage(null);
    setCreditsPurchasePending(true);

    try {
      const res = await fetch("/api/billing/purchase/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          idempotency_key: createIdempotencyKey("credits"),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        throw new Error(
          typeof body?.error === "string" ? body.error : "Unable to complete credit purchase.",
        );
      }

      setActionMessage({
        kind: "success",
        text: `${quantity} interview credit${quantity === 1 ? "" : "s"} added to your balance.`,
      });

      await loadSummary();
    } catch (err) {
      setActionMessage({
        kind: "error",
        text:
          err instanceof Error ? err.message : "Unable to complete credit purchase.",
      });
    } finally {
      setCreditsPurchasePending(false);
    }
  };

  if (checkingAuth) return null;

  const parsedCreditQuantity = Number.parseInt(creditQuantity, 10);
  const safeCreditQuantity =
    Number.isFinite(parsedCreditQuantity) && parsedCreditQuantity > 0
      ? parsedCreditQuantity
      : 1;
  const oneOffTotal = safeCreditQuantity * INTERVIEW_CREDIT_UNIT_PRICE_CENTS;

  const currentPlanId = summary?.current_plan.id ?? "free";
  const purchasablePlans = (summary?.plans ?? [])
    .map((plan) => ({
      plan,
      purchasableId: toPurchasablePlanId(plan.id),
    }))
    .filter((item) => item.purchasableId !== null);

  return (
    <div className="text-slate-900">
      <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing and credits</h1>
          <p className="text-sm text-slate-600">
            Manage your subscription package, buy additional interview credits, and track your available balance.
          </p>
        </div>

        {actionMessage ? (
          <div
            className={cn(
              "mt-5 rounded-xl border px-4 py-3 text-sm",
              actionMessage.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {actionMessage.text}
          </div>
        ) : null}

        {pageError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        ) : null}

        {loadingSummary ? (
          <div className="mt-10 flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-mm-violet" />
          </div>
        ) : summary ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Available interview credits</CardDescription>
                  <CardTitle className="text-3xl text-slate-900">{summary.available_credits}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    One interview session consumes exactly one credit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Current package</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="h-5 w-5 text-mm-violet" />
                    {summary.current_plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">
                    {formatPlanPrice(summary.current_plan)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Includes {summary.current_plan.interview_credits_included} interview credits per successful billing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Credit breakdown</CardDescription>
                  <CardTitle className="text-slate-900">Usage snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Granted from subscriptions</span>
                    <span className="font-medium text-slate-900">{summary.credit_totals.granted_subscription}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Granted from one-off purchases</span>
                    <span className="font-medium text-slate-900">{summary.credit_totals.granted_purchased}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consumed by interviews</span>
                    <span className="font-medium text-slate-900">{summary.credit_totals.consumed_total}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-5 w-5 text-mm-violet" />
                  Subscription packages
                </CardTitle>
                <CardDescription>
                  Upgrade or switch to a monthly package. Package credits stack with one-off credit purchases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {purchasablePlans.map(({ plan, purchasableId }) => {
                    if (!purchasableId) return null;

                    const isCurrent = currentPlanId === plan.id;
                    const isPending = planPurchasePending === purchasableId;

                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "rounded-2xl border p-5",
                          isCurrent
                            ? "border-mm-violet/40 bg-mm-violet/[0.03]"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                          {isCurrent ? <Badge>Current</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{formatPlanPrice(plan)}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {plan.interview_credits_included} interview credits per cycle
                        </p>

                        <Button
                          type="button"
                          className="mt-4 w-full"
                          disabled={
                            !plan.active ||
                            isCurrent ||
                            creditsPurchasePending ||
                            planPurchasePending !== null
                          }
                          onClick={() => handlePurchasePlan(purchasableId)}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isCurrent ? (
                            "Current plan"
                          ) : (
                            `Choose ${plan.name}`
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Wallet className="h-5 w-5 text-mm-violet" />
                  One-off interview credits
                </CardTitle>
                <CardDescription>
                  Buy additional credits at any time. Purchased credits do not expire.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="w-full max-w-xs">
                    <label htmlFor="credit-quantity" className="mb-2 block text-sm text-slate-600">
                      Quantity
                    </label>
                    <Input
                      id="credit-quantity"
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      inputMode="numeric"
                      value={creditQuantity}
                      onChange={(event) => {
                        setCreditQuantity(event.target.value);
                      }}
                    />
                  </div>

                  <div className="text-sm text-slate-600">
                    <div>
                      Unit price: {formatMoney(INTERVIEW_CREDIT_UNIT_PRICE_CENTS, "USD")}
                    </div>
                    <div className="font-medium text-slate-900">
                      Total: {formatMoney(oneOffTotal, "USD")}
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={planPurchasePending !== null || creditsPurchasePending}
                    onClick={handlePurchaseCredits}
                  >
                    {creditsPurchasePending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase credits"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900">Recent credit grants</CardTitle>
                  <CardDescription>Latest subscription and purchase credit grants.</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.recent_grants.length === 0 ? (
                    <p className="text-sm text-slate-500">No grants yet.</p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {summary.recent_grants.slice(0, 5).map((row) => (
                        <li key={row.id} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {row.source === "subscription_cycle"
                                ? "Subscription cycle"
                                : row.source === "one_off_purchase"
                                  ? "One-off purchase"
                                  : row.source}
                            </p>
                            <p className="text-slate-500">{formatDateTime(row.granted_at)}</p>
                          </div>
                          <span className="font-medium text-emerald-700">+{row.credits}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900">Recent credit consumption</CardTitle>
                  <CardDescription>Latest interviews that consumed credits.</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.recent_consumptions.length === 0 ? (
                    <p className="text-sm text-slate-500">No consumed credits yet.</p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {summary.recent_consumptions.slice(0, 5).map((row) => (
                        <li key={row.id} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{row.reason || "Interview"}</p>
                            <p className="text-slate-500">{formatDateTime(row.consumed_at)}</p>
                          </div>
                          <span className="font-medium text-slate-900">-{row.credits}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
