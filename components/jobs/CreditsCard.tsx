"use client";

import { CREDIT_PACKS } from "@/lib/billing";

interface CreditsCardProps {
  creditCount: number;
  onBuyClick: () => void;
  onPackClick?: (packId: string) => void;
  purchasing?: boolean;
}

export function CreditsCard({
  creditCount,
  onBuyClick,
  onPackClick,
  purchasing = false,
}: CreditsCardProps) {
  const hasCredits = creditCount > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Your Credits
        </span>
        <button
          type="button"
          onClick={onBuyClick}
          className="text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
        >
          {hasCredits ? "Buy more" : "View plans"} →
        </button>
      </div>

      {/* Credit Display */}
      <div className="px-5 py-4">
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-extrabold leading-none tracking-tight text-gray-900">
            {creditCount}
          </span>
          <span className="text-sm text-gray-500">
            {creditCount === 1 ? "credit" : "credits"} remaining
          </span>
        </div>

        {/* Credit Packs - only show when user has 0 credits */}
        {!hasCredits && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => onPackClick?.(pack.id)}
                disabled={purchasing}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center transition-all hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-sm font-bold text-gray-900">
                  {pack.credits} {pack.credits === 1 ? "credit" : "credits"}
                </div>
                <div className="text-xs text-gray-500">
                  ${(pack.priceCents / 100).toFixed(0)}
                </div>
                {pack.savingsPercent > 0 && (
                  <div className="mt-0.5 text-[10px] font-semibold text-green-600">
                    Save {pack.savingsPercent}%
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
