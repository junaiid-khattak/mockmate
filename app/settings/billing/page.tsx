"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Wallet, CreditCard } from "lucide-react";
import { Header } from "@/components/jobs/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { CREDIT_PACKS } from "@/lib/billing";

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
  credit_totals: {
    granted_purchased: number;
    refunded_total: number;
    consumed_total: number;
  };
  recent_grants: BillingGrant[];
  recent_consumptions: BillingConsumption[];
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
  const [pageError, setPageError] = useState<string | null>(null);

  const [checkingOut, setCheckingOut] = useState<string | null>(null);
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

  // Handle post-checkout redirect
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      setActionMessage({
        kind: "success",
        text: "Payment successful! Your credits have been added to your account.",
      });
      loadSummary();
      window.history.replaceState({}, "", "/settings/billing");
    } else if (checkoutStatus === "cancelled") {
      setActionMessage({
        kind: "notice",
        text: "Checkout was cancelled. No charges were made.",
      });
      window.history.replaceState({}, "", "/settings/billing");
    }
  }, [searchParams, loadSummary]);

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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing and credits</h1>
          <p className="text-sm text-slate-600">
            Purchase interview credit packs and track your balance.
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
            <Loader2 className="h-6 w-6 animate-spin text-mm-violet" />
          </div>
        ) : summary ? (
          <>
            {/* Balance & Breakdown */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
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

            {/* Credit Packs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-5 w-5 text-mm-violet" />
                  Buy interview credits
                </CardTitle>
                <CardDescription>
                  Purchase credit packs. Credits never expire and stack with each purchase.
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
                          ? "border-mm-violet/40 bg-mm-violet/[0.03]"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      {pack.recommended && (
                        <Badge className="mb-2">Recommended</Badge>
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

            {/* Recent History */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Wallet className="h-5 w-5 text-mm-violet" />
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
