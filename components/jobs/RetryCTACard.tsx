"use client";

interface RetryCTACardProps {
  onRetryInterview: () => void;
  currentScore: number;
  hasCredits: boolean;
  creditCount: number;
  disabled?: boolean;
  isStarting?: boolean;
}

export function RetryCTACard({
  onRetryInterview,
  currentScore,
  hasCredits,
  creditCount,
  disabled = false,
  isStarting = false,
}: RetryCTACardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-600 bg-white shadow-[0_4px_24px_rgba(124,92,252,0.2)]">
      {/* Glow effect */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 bg-[radial-gradient(circle,rgba(124,92,252,0.1)_0%,transparent_70%)]" />

      <div className="relative p-7">
        {/* Icon row */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-2xl shadow-[0_4px_16px_rgba(124,92,252,0.3)]">
            🔄
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Practice Again
            </div>
            <div className="text-xs text-gray-500">Improve your {currentScore.toFixed(1)} score</div>
          </div>
        </div>

        {/* Headline */}
        <h3 className="mb-2 text-xl font-extrabold leading-tight tracking-tight text-gray-900">
          New questions will target your weak areas
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          Each retry adapts based on where you struggled. Most users improve 1.5+ points on attempt #2.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onRetryInterview}
          disabled={disabled || isStarting}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-4 text-base font-bold tracking-tight text-white shadow-[0_4px_24px_rgba(124,92,252,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(124,92,252,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="text-lg">✨</span>
          <span>{isStarting ? "Starting..." : "Retry Interview"}</span>
        </button>

        {/* Price line */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>Uses 1 credit</span>
          <div className="h-1 w-1 rounded-full bg-gray-300" />
          <span>From $10</span>
        </div>

        {/* Social proof */}
        <div className="mt-5 border-t border-gray-200 pt-5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-sm">📈</span>
            <span>
              Avg. <span className="font-bold text-green-600">+1.5 pts</span> on retry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
