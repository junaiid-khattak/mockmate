"use client";

interface PreviewResultsTeaserProps {
  onStartInterview: () => void;
  isStarting?: boolean;
  disabled?: boolean;
}

const PREVIEW_METRICS = [
  { label: "Question understanding", score: "8.4" },
  { label: "Answer correctness", score: "7.1" },
  { label: "Communication clarity", score: "7.8" },
  { label: "Reasoning quality", score: "6.9" },
  { label: "Depth under follow-ups", score: "7.3" },
  { label: "Role alignment coverage", score: "8.0" },
];

const PREVIEW_STRENGTHS = [
  "Clear and structured communication throughout",
  "Demonstrated strong role-relevant examples",
];

const PREVIEW_GROWTH = [
  "Could improve depth when challenged with follow-ups",
  "Quantify impact in behavioral answers",
];

export function PreviewResultsTeaser({ onStartInterview, isStarting, disabled }: PreviewResultsTeaserProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e8ef] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e8e8ef] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">🔒</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b6b80]">
            Your Assessment Preview
          </h3>
        </div>
        <p className="mt-1 text-sm font-semibold text-[#111118]">
          How would you actually score?
        </p>
        <p className="mt-0.5 text-xs text-[#6b6b80]">
          Most candidates overestimate their readiness. See your real 10-metric breakdown.
        </p>
      </div>

      <div className="relative px-5 py-5">
        {/* Blur overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-[3px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(124,92,252,0.08)] text-2xl">
              🔒
            </div>
            <p className="text-sm font-semibold text-[#111118]">
              Unlock your full 10-metric breakdown
            </p>
            <p className="text-xs text-[#6b6b80]">Start your first mock interview to see your real scores</p>
          </div>
          <button
            type="button"
            onClick={onStartInterview}
            disabled={isStarting || disabled}
            className="pointer-events-auto rounded-lg bg-[#7c5cfc] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.25)] transition hover:bg-[#6341e0] disabled:opacity-50"
          >
            {isStarting ? "Starting..." : "Find out →"}
          </button>
        </div>

        {/* Blurred content beneath */}
        <div className="select-none">
          {/* Overall score mock */}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#7c5cfc] bg-[rgba(124,92,252,0.06)]">
              <span className="text-lg font-extrabold text-[#7c5cfc]">7.6</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111118]">Good Progress</p>
              <p className="text-xs text-[#6b6b80]">Attempt #1 · 28 min</p>
            </div>
          </div>

          {/* Metric grid */}
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {PREVIEW_METRICS.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-lg border border-[#e8e8ef] px-3 py-2"
              >
                <span className="text-xs text-[#6b6b80]">{m.label}</span>
                <span className="text-sm font-semibold text-[#111118]">{m.score}</span>
              </div>
            ))}
          </div>

          {/* Strengths */}
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6b80]">Strengths</p>
            <ul className="space-y-1">
              {PREVIEW_STRENGTHS.map((s, i) => (
                <li key={i} className="text-sm text-[#6b6b80]">• {s}</li>
              ))}
            </ul>
          </div>

          {/* Growth areas */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6b80]">Growth Areas</p>
            <ul className="space-y-1">
              {PREVIEW_GROWTH.map((s, i) => (
                <li key={i} className="text-sm text-[#6b6b80]">• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
