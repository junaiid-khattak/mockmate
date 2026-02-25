"use client";

import { useRouter } from "next/navigation";

interface NudgeBannerProps {
  firstJobId: string | undefined;
}

export function NudgeBanner({ firstJobId }: NudgeBannerProps) {
  const router = useRouter();

  const handleClick = () => {
    if (firstJobId) {
      router.push(`/jobs/${firstJobId}`);
    }
  };

  if (!firstJobId) return null;

  return (
    <div className="mb-5 flex items-center gap-4 rounded-xl border border-[rgba(124,92,252,0.18)] bg-gradient-to-br from-[rgba(124,92,252,0.06)] to-[rgba(56,189,248,0.04)] px-6 py-[18px]">
      {/* Icon */}
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#9b82fd] text-[20px] shadow-[0_3px_12px_rgba(124,92,252,0.25)]">
        🎙️
      </div>

      {/* Text */}
      <div className="flex-1">
        <strong className="mb-[2px] block text-sm font-bold text-[#111118]">
          You haven't practiced yet — start your first mock interview
        </strong>
        <span className="text-[13px] text-[#6b6b80]">
          You have a fit score and tailored questions ready. Practice answering
          them with AI feedback.
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={handleClick}
        className="whitespace-nowrap rounded-lg bg-[#7c5cfc] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.2)] transition-all hover:bg-[#6341e0] hover:shadow-[0_4px_16px_rgba(124,92,252,0.3)]"
      >
        Start Interview →
      </button>
    </div>
  );
}
