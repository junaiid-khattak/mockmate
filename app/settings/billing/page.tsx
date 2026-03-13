"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Wallet, CreditCard, Crown, Check } from "lucide-react";
import { Header } from "@/components/jobs/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { CREDIT_PACKS } from "@/lib/billing";
import { SUBSCRIPTION_PLANS, FREE_PLAN } from "@/lib/subscription";
import { getUserDisplayFirstName } from "@/lib/auth/user-name";

type BillingGrant = {
  id: string;
  source: string;
  credits: number;
  granted_at: string;
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
  credit_totals: {
    granted_purchased: number;
    refunded_total: number;
    consumed_total: number;
  };
  recent_grants: BillingGrant[];
  recent_consumptions: BillingConsumption[];
};

type SubscriptionStatus = {
  has_subscription: boolean;
  status: string | null;
  plan: string | null;
  sessions_used: number;
  sessions_limit: number;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  legacy_credits: number;
};

type ActionMessage = {
  kind: "success" | "notice" | "error";
  text: string;
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function BillingPageWrapper() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}

function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelingOrReactivating, setCancelingOrReactivating] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  const loadData = useCallback(async () => {
    setLoadingSummary(true);
    setPageError(null);

    try {
      const [summaryRes, subRes] = await Promise.all([
        fetch("/api/billing/summary", { cache: "no-store" }),
        fetch("/api/billing/subscription/status", { cache: "no-store" }),
      ]);

      if (summaryRes.status === 401 || subRes.status === 401) {
        router.replace("/login");
        return;
      }

      const summaryBody = await summaryRes.json().catch(() => ({}));
      if (!summaryRes.ok || !summaryBody?.ok || !summaryBody.summary) {
        throw new Error(
          typeof summaryBody?.error === "string" ? summaryBody.error : "Unable to load billing summary.",
        );
      }
      setSummary(summaryBody.summary as BillingSummary);

      const subBody = await subRes.json().catch(() => ({}));
      if (subBody?.ok) {
        setSubStatus(subBody as SubscriptionStatus);
      }
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

      setFirstName(getUserDisplayFirstName(data.user));
      setCheckingAuth(false);

      await loadData();
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadData, router, supabase]);

  // Handle post-checkout/subscription redirect
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const subscriptionStatus = searchParams.get("subscription");

    if (checkoutStatus === "success") {
      setActionMessage({
        kind: "success",
        text: "Payment successful! Your credits have been added to your account.",
      });
      loadData();
      window.history.replaceState({}, "", "/settings/billing");
    } else if (checkoutStatus === "cancelled") {
      setActionMessage({
        kind: "notice",
        text: "Checkout was cancelled. No charges were made.",
      });
      window.history.replaceState({}, "", "/settings/billing");
    } else if (subscriptionStatus === "success") {
      setActionMessage({
        kind: "success",
        text: "Welcome to your subscription! Your plan is now active.",
      });
      loadData();
      window.history.replaceState({}, "", "/settings/billing");
    } else if (subscriptionStatus === "cancelled") {
      setActionMessage({
        kind: "notice",
        text: "Subscription checkout was cancelled. No charges were made.",
      });
      window.history.replaceState({}, "", "/settings/billing");
    }
  }, [searchParams, loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const handleBuyPack = async (packId: string) => {
    setCheckingOut(packId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.ok || !body.checkout_url) {
        throw new Error(body?.error ?? "Unable to start checkout.");
      }

      window.location.assign(body.checkout_url);
    } catch (err) {
      setActionMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Unable to start checkout.",
      });
      setCheckingOut(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.ok || !body.checkout_url) {
        throw new Error(body?.error ?? "Unable to start subscription checkout.");
      }

      window.location.assign(body.checkout_url);
    } catch (err) {
      setActionMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Unable to start subscription checkout.",
      });
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelingOrReactivating(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/billing/subscription/cancel", {
        method: "POST",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.ok) {
        throw new Error(body?.error ?? "Unable to cancel subscription.");
      }

      setActionMessage({
        kind: "notice",
        text: body.message ?? "Your subscription has been set to cancel at the end of the billing period.",
      });
      await loadData();
    } catch (err) {
      setActionMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Unable to cancel subscription.",
      });
    } finally {
      setCancelingOrReactivating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setCancelingOrReactivating(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/billing/subscription/reactivate", {
        method: "POST",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.ok) {
        throw new Error(body?.error ?? "Unable to reactivate subscription.");
      }

      setActionMessage({
        kind: "success",
        text: "Your subscription has been reactivated!",
      });
      await loadData();
    } catch (err) {
      setActionMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Unable to reactivate subscription.",
      });
    } finally {
      setCancelingOrReactivating(false);
    }
  };

  const isFreePlan = subStatus?.plan === "free";
  const hasPaidSub = subStatus?.has_subscription && !isFreePlan && (subStatus.status === "active" || subStatus.status === "past_due");
  const hasAnySub = subStatus?.has_subscription && (subStatus.status === "active" || subStatus.status === "past_due");

  if (checkingAuth) return null;

  return (
    <div className="text-slate-900">
      <Header
        firstName={firstName}
        creditBalance={summary?.available_credits ?? null}
        onLogout={handleLogout}
        backHref="/jobs"
        backLabel="Jobs"
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
          <p className="text-sm text-slate-600">
            Manage your subscription and interview credits.
          </p>
        </div>

        {actionMessage ? (
          <div
            className={cn(
              "mt-5 rounded-xl border px-4 py-3 text-sm",
              actionMessage.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : actionMessage.kind === "notice"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
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
            <Loader2 className="h-6 w-6 animate-spin text-[#7c5cfc]" />
          </div>
        ) : summary ? (
          <>
            {/* ─── Current Plan Card ─── */}
            {hasAnySub && subStatus ? (
              <Card className={cn(
                "mt-6",
                hasPaidSub
                  ? "border-[#7c5cfc]/20 bg-[rgba(124,92,252,0.03)]"
                  : "border-slate-200",
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Crown className={cn("h-5 w-5", hasPaidSub ? "text-[#7c5cfc]" : "text-slate-400")} />
                    Your plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-slate-900">
                          {isFreePlan
                            ? "Free"
                            : `${SUBSCRIPTION_PLANS.find((p) => p.id === subStatus.plan)?.name ?? subStatus.plan}`} Plan
                        </span>
                        {isFreePlan ? (
                          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600">Free</Badge>
                        ) : subStatus.cancel_at_period_end ? (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Canceling</Badge>
                        ) : subStatus.status === "past_due" ? (
                          <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">Past due</Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {subStatus.sessions_used} of {subStatus.sessions_limit} session{subStatus.sessions_limit !== 1 ? "s" : ""} used
                        {isFreePlan ? "" : " this period"}
                      </p>
                      {/* Sessions progress bar */}
                      <div className="h-2 w-48 rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            isFreePlan ? "bg-slate-400" : "bg-[#7c5cfc]",
                          )}
                          style={{ width: `${Math.min((subStatus.sessions_used / subStatus.sessions_limit) * 100, 100)}%` }}
                        />
                      </div>
                      {!isFreePlan && subStatus.current_period_end && (
                        <p className="text-xs text-slate-500">
                          {subStatus.cancel_at_period_end
                            ? `Access until ${formatDate(subStatus.current_period_end)}`
                            : `Renews ${formatDate(subStatus.current_period_end)}`}
                        </p>
                      )}
                    </div>

                    <div>
                      {isFreePlan ? (
                        <Button
                          className="bg-[#7c5cfc] hover:bg-[#6a4be0]"
                          onClick={() => {
                            document.getElementById("upgrade-plans")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Upgrade plan
                        </Button>
                      ) : subStatus.cancel_at_period_end ? (
                        <Button
                          variant="outline"
                          disabled={cancelingOrReactivating}
                          onClick={handleReactivateSubscription}
                        >
                          {cancelingOrReactivating ? "Reactivating..." : "Reactivate subscription"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="text-slate-500 hover:text-red-600"
                          disabled={cancelingOrReactivating}
                          onClick={handleCancelSubscription}
                        >
                          {cancelingOrReactivating ? "Canceling..." : "Cancel subscription"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* ─── Subscription Plans (show for free users or users with no sub) ─── */}
            {!hasPaidSub ? (
              <Card className="mt-6" id="upgrade-plans">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Crown className="h-5 w-5 text-[#7c5cfc]" />
                    {isFreePlan ? "Upgrade your plan" : "Subscribe for the best value"}
                  </CardTitle>
                  <CardDescription>
                    Monthly plans with interview sessions that reset each billing cycle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Free plan column (current) */}
                    <div className={cn(
                      "relative flex flex-col rounded-2xl border p-5",
                      isFreePlan
                        ? "border-slate-300 bg-slate-50/50"
                        : "border-slate-200 bg-white",
                    )}>
                      {isFreePlan && (
                        <Badge variant="outline" className="absolute -top-2.5 left-1/2 -translate-x-1/2 border-slate-300 bg-white text-slate-600">
                          Current plan
                        </Badge>
                      )}
                      <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-slate-900">$0</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">No credit card required</p>

                      <ul className="mt-4 flex-1 space-y-2">
                        {FREE_PLAN.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isFreePlan ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-5 w-full"
                          disabled
                        >
                          Current plan
                        </Button>
                      ) : (
                        <div className="mt-5" />
                      )}
                    </div>

                    {/* Paid plans */}
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          "relative flex flex-col rounded-2xl border p-5",
                          plan.recommended
                            ? "border-[#7c5cfc]/40 bg-[rgba(124,92,252,0.03)]"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        {plan.recommended && (
                          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#7c5cfc] text-white">
                            Most popular
                          </Badge>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-slate-900">
                            ${(plan.priceCents / 100).toFixed(0)}
                          </span>
                          <span className="text-sm text-slate-500">/month</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          ${(plan.perSessionCents / 100).toFixed(2)} per session
                        </p>

                        <ul className="mt-4 flex-1 space-y-2">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          type="button"
                          className={cn(
                            "mt-5 w-full",
                            plan.recommended
                              ? "bg-[#7c5cfc] hover:bg-[#6a4be0]"
                              : "",
                          )}
                          disabled={subscribing !== null}
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          {subscribing === plan.id ? "Redirecting..." : "Upgrade"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* ─── Balance & Breakdown ─── */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardDescription>Available interview credits</CardDescription>
                  <CardTitle className="text-3xl text-slate-900">{summary.available_credits}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {hasPaidSub
                      ? "Legacy credits from previous purchases. These are used after your subscription sessions run out."
                      : "One interview session consumes exactly one credit."}
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
                    <span>Purchased</span>
                    <span className="font-medium text-slate-900">{summary.credit_totals.granted_purchased}</span>
                  </div>
                  {summary.credit_totals.refunded_total > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Refunded</span>
                      <span className="font-medium text-rose-600">-{summary.credit_totals.refunded_total}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Consumed by interviews</span>
                    <span className="font-medium text-slate-900">{summary.credit_totals.consumed_total}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── Credit Packs ─── */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-5 w-5 text-[#7c5cfc]" />
                  Buy interview credits
                </CardTitle>
                <CardDescription>
                  {hasPaidSub
                    ? "Top up with credit packs. Credits never expire and are used after your subscription sessions."
                    : "Purchase credit packs. Credits never expire and stack with each purchase."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {CREDIT_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      className={cn(
                        "rounded-2xl border p-5 text-center",
                        pack.recommended
                          ? "border-[#7c5cfc]/40 bg-[rgba(124,92,252,0.03)]"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      {pack.recommended && (
                        <Badge className="mb-2 bg-[#7c5cfc] text-white">Recommended</Badge>
                      )}
                      <h3 className="text-lg font-semibold text-slate-900">{pack.name}</h3>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        ${(pack.priceCents / 100).toFixed(0)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {pack.credits} credit{pack.credits !== 1 ? "s" : ""}
                      </p>
                      {pack.savingsPercent > 0 && (
                        <p className="mt-1 text-xs font-medium text-emerald-600">
                          Save {pack.savingsPercent}%
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 w-full"
                        disabled={checkingOut !== null}
                        onClick={() => handleBuyPack(pack.id)}
                      >
                        {checkingOut === pack.id ? "Redirecting..." : "Buy"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── Recent History ─── */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Wallet className="h-5 w-5 text-[#7c5cfc]" />
                    Recent credit grants
                  </CardTitle>
                  <CardDescription>Latest credit purchases and adjustments.</CardDescription>
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
                              {row.source === "one_off_purchase"
                                ? "Credit purchase"
                                : row.source === "stripe_refund"
                                  ? "Refund"
                                  : row.source === "subscription_cycle"
                                    ? "Subscription cycle"
                                    : row.source}
                            </p>
                            <p className="text-slate-500">{formatDateTime(row.granted_at)}</p>
                          </div>
                          <span
                            className={cn(
                              "font-medium",
                              row.credits > 0 ? "text-emerald-700" : "text-rose-600",
                            )}
                          >
                            {row.credits > 0 ? `+${row.credits}` : `${row.credits}`}
                          </span>
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
