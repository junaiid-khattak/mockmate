"use client";

interface StickyBottomBarProps {
  onStartInterview: () => void;
  disabled?: boolean;
  isStarting?: boolean;
  visible?: boolean;
  // Dynamic content based on state
  icon?: string;
  text: string;
  subtext?: string;
  buttonLabel: string;
}

export function StickyBottomBar({
  onStartInterview,
  disabled = false,
  isStarting = false,
  visible = true,
  icon = "🎙️",
  text,
  subtext,
  buttonLabel,
}: StickyBottomBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-5 border-t border-gray-200 bg-white/95 px-8 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">
        {text}
        {subtext && <span className="font-normal text-gray-500"> {subtext}</span>}
      </span>
      <button
        type="button"
        onClick={onStartInterview}
        disabled={disabled || isStarting}
        className="rounded-lg bg-purple-600 px-7 py-2.5 text-sm font-bold text-white shadow-[0_2px_12px_rgba(124,92,252,0.3)] transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isStarting ? "Starting..." : buttonLabel}
      </button>
    </div>
  );
}
