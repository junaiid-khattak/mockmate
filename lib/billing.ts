export const BILLING_PROVIDER = "dashboard";
export const INTERVIEW_CREDIT_UNIT_PRICE_CENTS = 1000;
export const ONE_OFF_CREDIT_ORDER_PLAN_ID = "one_off";
export const BILLING_PURCHASES_COMING_SOON_MESSAGE =
  "Paid subscriptions and one-off interview purchases are coming soon. For now, plans and credits are managed manually.";

export const BILLING_PLAN_IDS = ["free", "standard", "pro"] as const;
export type BillingPlanId = (typeof BILLING_PLAN_IDS)[number];

export const BILLING_PURCHASABLE_PLAN_IDS = ["standard", "pro"] as const;
export type PurchasableBillingPlanId = (typeof BILLING_PURCHASABLE_PLAN_IDS)[number];

export function isBillingPlanId(value: unknown): value is BillingPlanId {
  return typeof value === "string" &&
    (BILLING_PLAN_IDS as readonly string[]).includes(value);
}

export function isPurchasableBillingPlanId(
  value: unknown,
): value is PurchasableBillingPlanId {
  return typeof value === "string" &&
    (BILLING_PURCHASABLE_PLAN_IDS as readonly string[]).includes(value);
}

export function normalizeCurrency(value: unknown): string {
  if (typeof value !== "string") return "USD";
  const cleaned = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(cleaned)) return "USD";
  return cleaned;
}

export function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed);
    }
  }
  return null;
}
