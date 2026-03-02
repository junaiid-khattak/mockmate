"use client";

interface UrgencyBannerProps {
  interviewDate: string; // YYYY-MM-DD
  company: string | null;
  title: string | null;
  onStartInterview: () => void;
  isStarting?: boolean;
  disabled?: boolean;
}

export function UrgencyBanner({
  interviewDate,
  company,
  title,
  onStartInterview,
  isStarting,
  disabled,
}: UrgencyBannerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(interviewDate + "T00:00:00");
  const daysUntil = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Don't show if the date has passed or is more than 14 days away
  if (daysUntil < 0 || daysUntil > 14) return null;

  const isCritical = daysUntil <= 3;
  const roleLabel = [title, company ? `at ${company}` : null].filter(Boolean).join(" ") || "this role";

  const dayText =
    daysUntil === 0
      ? "today"
      : daysUntil === 1
        ? "tomorrow"
        : `in ${daysUntil} days`;

  return (
    <div
      className={[
        "mb-6 flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        isCritical
          ? "border-red-200 bg-red-50"
          : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div className="flex flex-col gap-1">
        <p className={`text-sm font-semibold ${isCritical ? "text-red-800" : "text-amber-900"}`}>
          Your interview for{" "}
          <span className="font-bold">{roleLabel}</span>{" "}
          is{" "}
          <span className={isCritical ? "text-red-600" : "text-amber-700"}>{dayText}</span>.
        </p>
        <p className={`text-xs ${isCritical ? "text-red-700" : "text-amber-800"}`}>
          Most candidates who score 8+ practice 2–3 times before their real interview.
        </p>
      </div>
      <button
        type="button"
        onClick={onStartInterview}
        disabled={isStarting || disabled}
        className={[
          "shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50",
          isCritical
            ? "bg-red-600 hover:bg-red-700 shadow-[0_2px_10px_rgba(220,38,38,0.2)]"
            : "bg-amber-600 hover:bg-amber-700 shadow-[0_2px_10px_rgba(217,119,6,0.2)]",
        ].join(" ")}
      >
        {isStarting ? "Starting..." : "Start practicing now →"}
      </button>
    </div>
  );
}
