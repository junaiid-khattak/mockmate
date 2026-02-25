"use client";

interface InterviewResultsHeroProps {
  attemptNumber: number;
  overallScore: number;
  title: string;
  summary: string;
  breakdown: Array<{
    label: string;
    score: number;
  }>;
  isBestScore?: boolean;
}

export function InterviewResultsHero({
  attemptNumber,
  overallScore,
  title,
  summary,
  breakdown,
  isBestScore = false,
}: InterviewResultsHeroProps) {
  // Determine border and accent color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "green";
    if (score >= 7.0) return "amber";
    return "red";
  };

  const scoreColor = getScoreColor(overallScore);

  const colorClasses = {
    green: {
      border: "border-green-600",
      bg: "bg-green-50",
      text: "text-green-600",
      barBg: "bg-green-600",
      ring: "border-green-600 bg-green-50",
      badgeBg: "bg-green-100",
      badgeBorder: "border-green-200",
      shadow: "shadow-[0_4px_24px_rgba(22,163,74,0.12)]",
    },
    amber: {
      border: "border-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-600",
      barBg: "bg-amber-600",
      ring: "border-amber-600 bg-amber-50",
      badgeBg: "bg-amber-100",
      badgeBorder: "border-amber-200",
      shadow: "shadow-[0_4px_24px_rgba(217,119,6,0.12)]",
    },
    red: {
      border: "border-red-600",
      bg: "bg-red-50",
      text: "text-red-600",
      barBg: "bg-red-600",
      ring: "border-red-600 bg-red-50",
      badgeBg: "bg-red-100",
      badgeBorder: "border-red-200",
      shadow: "shadow-[0_4px_24px_rgba(220,38,38,0.12)]",
    },
  };

  const colors = colorClasses[scoreColor];

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 bg-white ${colors.border} ${colors.shadow}`}
    >
      <div className="px-6 py-7">
        {/* Completed Badge */}
        <div
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${colors.text} ${colors.badgeBg} ${colors.badgeBorder}`}
        >
          ✓ Interview #{attemptNumber}{isBestScore && " · Best Score"}
        </div>

        {/* Score Row */}
        <div className="mb-5 flex items-center gap-5">
          {/* Score Ring */}
          <div
            className={`flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-full border-4 ${colors.ring}`}
          >
            <span className={`text-2xl font-extrabold leading-none ${colors.text}`}>
              {overallScore.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">/10</span>
          </div>

          {/* Meta */}
          <div>
            <h4 className="mb-1 text-[17px] font-bold text-gray-900">{title}</h4>
            <p className="text-sm leading-relaxed text-gray-600">{summary}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-2.5">
          {breakdown.map((metric, i) => {
            const metricColor = getScoreColor(metric.score);
            const metricColors = colorClasses[metricColor];
            const percentage = (metric.score / 10) * 100;

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-[110px] shrink-0 text-xs text-gray-500">
                  {metric.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${metricColors.barBg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={`w-9 text-right text-sm font-semibold ${metricColors.text}`}>
                  {metric.score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
