"use client";

interface InterviewAttempt {
  attemptNumber: number;
  score: number;
  date: string;
  durationMinutes: number;
  isBest?: boolean;
}

interface InterviewHistoryCardProps {
  attempts: InterviewAttempt[];
  activeAttemptNumber: number;
  onSelectAttempt: (attemptNumber: number) => void;
}

export function InterviewHistoryCard({
  attempts,
  activeAttemptNumber,
  onSelectAttempt,
}: InterviewHistoryCardProps) {
  // Sort attempts by attemptNumber ascending (chronological order)
  const sortedAttempts = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);

  // Calculate trend (difference between first and last chronologically)
  const firstScore = sortedAttempts[0]?.score ?? 0;
  const lastScore = sortedAttempts[sortedAttempts.length - 1]?.score ?? 0;
  const improvement = lastScore - firstScore;

  // Calculate delta for each attempt (chronological order)
  const attemptsWithDelta = sortedAttempts.map((attempt, index) => {
    if (index === 0) {
      return { ...attempt, delta: 0, deltaLabel: "Baseline" };
    }
    const prevScore = sortedAttempts[index - 1].score;
    const delta = attempt.score - prevScore;
    return {
      ...attempt,
      delta,
      deltaLabel: delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1),
    };
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          📋 Interview History
        </span>
        <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
          {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
        </span>
      </div>

      {/* Attempt List */}
      <div className="divide-y divide-gray-100">
        {attemptsWithDelta.slice().reverse().map((attempt) => {
          const isActive = attempt.attemptNumber === activeAttemptNumber;
          const scoreColor = attempt.score >= 8 ? "text-green-600" : attempt.score >= 7 ? "text-amber-600" : "text-gray-600";

          return (
            <button
              key={attempt.attemptNumber}
              type="button"
              onClick={() => onSelectAttempt(attempt.attemptNumber)}
              className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                isActive ? "border-l-[3px] border-l-purple-600 bg-purple-50 pl-[17px]" : ""
              }`}
            >
              {/* Number circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                  isActive
                    ? "border-purple-600 bg-purple-600 text-white shadow-[0_2px_8px_rgba(124,92,252,0.25)]"
                    : "border-gray-200 bg-gray-100 text-gray-500"
                }`}
              >
                {attempt.attemptNumber}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${isActive ? "text-purple-600" : "text-gray-900"}`}>
                  Attempt #{attempt.attemptNumber}
                  {attempt.isBest && " · Best"}
                </div>
                <div className="text-xs text-gray-500">
                  {attempt.date} · {attempt.durationMinutes} min
                </div>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <div className={`text-lg font-extrabold leading-none ${scoreColor}`}>
                  {attempt.score.toFixed(1)}
                </div>
                <div
                  className={`mt-0.5 text-[10px] font-semibold ${
                    attempt.delta > 0 ? "text-green-600" : attempt.delta < 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {attempt.deltaLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
