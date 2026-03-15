"use client";

interface CreditsCardProps {
  creditCount: number;
  onBuyClick: () => void;
  purchasing?: boolean;
  /** Addon credit balance for subscribers */
  addonCredits?: number;
  /** Price per addon credit in cents */
  addonCreditPriceCents?: number | null;
  /** Whether user has an active subscription */
  hasSubscription?: boolean;
}

export function CreditsCard({
  creditCount,
  onBuyClick,
  purchasing = false,
  addonCredits = 0,
  addonCreditPriceCents,
  hasSubscription = false,
}: CreditsCardProps) {
  const totalCredits = creditCount + addonCredits;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {hasSubscription ? "Your Plan" : "Your Credits"}
        </span>
        <button
          type="button"
          onClick={onBuyClick}
          className="text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
        >
          {hasSubscription ? "Manage plan" : "See plans"} →
        </button>
      </div>

      {/* Credit Display */}
      <div className="px-5 py-4">
        {hasSubscription ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-extrabold leading-none tracking-tight text-gray-900">
                {creditCount}
              </span>
              <span className="text-sm text-gray-500">
                {creditCount === 1 ? "session" : "sessions"} remaining
              </span>
            </div>

            {addonCredits > 0 && (
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  +{addonCredits}
                </span>
                <span className="text-xs text-gray-500">
                  add-on {addonCredits === 1 ? "credit" : "credits"}
                </span>
              </div>
            )}

            {addonCreditPriceCents != null && (
              <button
                type="button"
                onClick={onBuyClick}
                disabled={purchasing}
                className="mt-3 w-full rounded-lg border border-[rgba(124,92,252,0.3)] bg-[rgba(124,92,252,0.04)] px-3 py-2 text-xs font-semibold text-[#7c5cfc] transition hover:bg-[rgba(124,92,252,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy more · ${(addonCreditPriceCents / 100).toFixed(0)} each
              </button>
            )}
          </>
        ) : totalCredits > 0 ? (
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-gray-900">
              {totalCredits}
            </span>
            <span className="text-sm text-gray-500">
              {totalCredits === 1 ? "credit" : "credits"} remaining
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-700">
              Subscribe to start interviewing
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Plans start at $20/month with 10 interviews included.
            </p>
            <button
              type="button"
              onClick={onBuyClick}
              disabled={purchasing}
              className="mt-3 w-full rounded-lg bg-[#7c5cfc] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6b4ee0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              View plans
            </button>
          </>
        )}
      </div>
    </div>
  );
}
