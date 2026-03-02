"use client";

interface InterviewCTACardProps {
  onStartInterview: () => void;
  hasCredits: boolean;
  creditCount: number;
  disabled?: boolean;
  isStarting?: boolean;
  fitScore?: number | null;
  weakSpots?: string[] | null;
}

export function InterviewCTACard({
  onStartInterview,
  hasCredits,
  creditCount,
  disabled = false,
  isStarting = false,
  fitScore,
  weakSpots,
}: InterviewCTACardProps) {
  const hasContext = fitScore != null && weakSpots && weakSpots.length > 0;
  const topWeakSpots = weakSpots?.slice(0, 2) ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-600 bg-white shadow-[0_4px_24px_rgba(124,92,252,0.2)]">
      {/* Glow effect */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 bg-[radial-gradient(circle,rgba(124,92,252,0.1)_0%,transparent_70%)]" />

      <div className="relative p-7">
        {/* Icon row */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-2xl shadow-[0_4px_16px_rgba(124,92,252,0.3)]">
            🎙️
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600">
              AI Mock Interview
            </div>
            <div className="text-xs text-gray-500">Personalized to this job</div>
          </div>
        </div>

        {/* Headline */}
        <h3 className="mb-2 text-xl font-extrabold leading-tight tracking-tight text-gray-900">
          {hasContext
            ? "Your mock interview will target your gaps"
            : "Practice these questions with real-time AI feedback"}
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          {hasContext
            ? `You scored ${fitScore}/10. Your AI interviewer will probe exactly your weak areas and show you how to close the gap before your real interview.`
            : "Our AI interviewer adapts in real-time, asks follow-ups, and gives you a detailed performance breakdown."}
        </p>

        {/* Features */}
        <div className="mb-6 flex flex-col gap-2">
          {hasContext ? (
            <>
              {topWeakSpots.map((spot, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-[10px] text-amber-600">
                    ↑
                  </div>
                  <span className="line-clamp-1">{spot}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
                  ✓
                </div>
                <span>10-metric performance breakdown</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
                  ✓
                </div>
                <span>Adaptive follow-up probes</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
                  ✓
                </div>
                <span>Targets your weak spots</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
                  ✓
                </div>
                <span>Detailed performance assessment</span>
              </div>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onStartInterview}
          disabled={disabled || isStarting}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-4 text-base font-bold tracking-tight text-white shadow-[0_4px_24px_rgba(124,92,252,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(124,92,252,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="text-lg">✨</span>
          <span>{isStarting ? "Starting..." : "Start Mock Interview"}</span>
        </button>

        {/* Price line */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>Uses 1 credit</span>
          <div className="h-1 w-1 rounded-full bg-gray-300" />
          <span>From $5</span>
        </div>

        {/* Social proof */}
        <div className="mt-5 flex flex-col gap-2.5 border-t border-gray-200 pt-5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-sm">📊</span>
            <span>
              <span className="font-bold text-green-600">95%</span> of users felt more prepared
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-sm">🎯</span>
            <span>
              <span className="font-bold text-green-600">10,000+</span> questions practiced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
