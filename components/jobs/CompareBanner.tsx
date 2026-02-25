"use client";

interface CompareBannerProps {
  totalImprovement: number;
  bestScore: number;
  attemptCount: number;
}

export function CompareBanner({
  totalImprovement,
  bestScore,
  attemptCount,
}: CompareBannerProps) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
        📈
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-900">
          You've improved +{totalImprovement.toFixed(1)} points across {attemptCount} interviews
        </div>
        <div className="mt-0.5 text-sm text-gray-600">
          Your best score is {bestScore.toFixed(1)}/10. Click any attempt to view full results, or
          compare side-by-side below.
        </div>
      </div>
    </div>
  );
}
