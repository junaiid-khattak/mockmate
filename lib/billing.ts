export const BILLING_PROVIDER = "stripe";

export type CreditPackId = "starter" | "standard" | "pro" | "power";

export type CreditPack = {
  id: CreditPackId;
  name: string;
  credits: number;
  priceCents: number;
  perCreditCents: number;
  savingsPercent: number;
  recommended?: boolean;
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 1,
    priceCents: 1000,
    perCreditCents: 1000,
    savingsPercent: 0,
  },
  {
    id: "standard",
    name: "Standard",
    credits: 3,
    priceCents: 2500,
    perCreditCents: 833,
    savingsPercent: 17,
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 5,
    priceCents: 3900,
    perCreditCents: 780,
    savingsPercent: 22,
  },
  {
    id: "power",
    name: "Power",
    credits: 10,
    priceCents: 6900,
    perCreditCents: 690,
    savingsPercent: 31,
  },
];

export const CREDIT_PACK_IDS = CREDIT_PACKS.map((p) => p.id);

export function isCreditPackId(value: unknown): value is CreditPackId {
  return (
    typeof value === "string" &&
    CREDIT_PACK_IDS.includes(value as CreditPackId)
  );
}

export function getCreditPack(id: CreditPackId): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export function getStripePriceId(packId: CreditPackId): string {
  const envKey = `STRIPE_PRICE_ID_${packId.toUpperCase()}`;
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }
  return value;
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
