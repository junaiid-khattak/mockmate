"use client";

import { useState } from "react";

interface AttemptScores {
  attemptNumber: number;
  overallScore: number;
  breakdown: {
    [key: string]: number;
  };
}

interface CompareAttemptsTableProps {
  attempts: AttemptScores[];
  metrics: Array<{ key: string; label: string }>;
  defaultOpen?: boolean;
}

export function CompareAttemptsTable({
  attempts,
  metrics,
  defaultOpen = true,
}: CompareAttemptsTableProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "text-green-600";
    if (score >= 7.0) return "text-amber-600";
    return "text-gray-600";
  };

  const findBestScoreForMetric = (metricKey: string) => {
    let maxScore = -Infinity;
    attempts.forEach((attempt) => {
      const score = attempt.breakdown[metricKey] ?? 0;
      if (score > maxScore) maxScore = score;
    });
    return maxScore;
  };

  const findBestOverallScore = () => {
    let maxScore = -Infinity;
    attempts.forEach((attempt) => {
      if (attempt.overallScore > maxScore) maxScore = attempt.overallScore;
    });
    return maxScore;
  };

  const bestOverallScore = findBestOverallScore();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-purple-600">📊</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Compare All Attempts
          </h3>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Side-by-side
          </span>
        </div>
        <span
          className={`text-xs text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                {attempts.map((attempt) => (
                  <th
                    key={attempt.attemptNumber}
                    className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Attempt {attempt.attemptNumber}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const bestScore = findBestScoreForMetric(metric.key);
                return (
                  <tr key={metric.key} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-700">{metric.label}</td>
                    {attempts.map((attempt) => {
                      const score = attempt.breakdown[metric.key] ?? 0;
                      const isBest = score === bestScore && bestScore > 0;
                      const colorClass = getScoreColor(score);

                      return (
                        <td
                          key={attempt.attemptNumber}
                          className={`px-4 py-3 text-center text-sm font-bold ${colorClass} ${
                            isBest ? "rounded-md bg-green-50" : ""
                          }`}
                        >
                          {score.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Overall row */}
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3.5 text-base font-extrabold text-gray-900">Overall</td>
                {attempts.map((attempt) => {
                  const isBest = attempt.overallScore === bestOverallScore;
                  const colorClass = getScoreColor(attempt.overallScore);

                  return (
                    <td
                      key={attempt.attemptNumber}
                      className={`px-4 py-3.5 text-center text-base font-extrabold ${colorClass} ${
                        isBest ? "rounded-md bg-green-50" : ""
                      }`}
                    >
                      {attempt.overallScore.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
