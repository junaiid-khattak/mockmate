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
  disabled = false,
  isStarting = false,
  fitScore,
  weakSpots,
}: InterviewCTACardProps) {
  const hasContext = fitScore != null && weakSpots && weakSpots.length > 0;
  const topWeakSpots = weakSpots?.slice(0, 2) ?? [];
  const gapText =
    topWeakSpots.length >= 2
      ? `${topWeakSpots[0]} and ${topWeakSpots[1]}`
      : topWeakSpots[0] ?? "your weak areas";

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
              AI MOCK INTERVIEW
            </div>
            <div className="text-xs text-gray-500">Personalized to this job</div>
          </div>
        </div>

        {/* Headline */}
        <h3 className="mb-2 text-xl font-extrabold leading-tight tracking-tight text-gray-900">
          Close your gaps before interview day
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          {hasContext
            ? `Your AI interviewer will push on ${gapText} — the exact areas where you'd lose points in a real interview.`
            : "Your AI interviewer adapts in real-time, asks follow-ups, and gives you a detailed performance breakdown."}
        </p>

        {/* Features */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-sm text-gray-700">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
              ✓
            </div>
            <span>Adaptive follow-ups that dig into your weak spots</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-700">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
              ✓
            </div>
            <span>Scored across 10 metrics real interviewers use</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-700">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] text-green-600">
              ✓
            </div>
            <span>Full transcript + specific next actions</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onStartInterview}
          disabled={disabled || isStarting}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-4 text-base font-bold tracking-tight text-white shadow-[0_4px_24px_rgba(124,92,252,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(124,92,252,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isStarting ? "Starting..." : "Start Practicing →"}
        </button>

        {/* Price line */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>1 credit</span>
          <div className="h-1 w-1 rounded-full bg-gray-300" />
          <span>$5 for first interview</span>
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
