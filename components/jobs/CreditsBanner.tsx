"use client";

import { useRouter } from "next/navigation";

interface CreditsBannerProps {
  creditCount: number;
}

export function CreditsBanner({ creditCount }: CreditsBannerProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/settings/billing");
  };

  return (
    <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-[rgba(217,119,6,0.15)] bg-[rgba(217,119,6,0.07)] px-5 py-3.5">
      <div className="text-lg">⚡</div>

      <div className="flex-1 text-[13px] text-[#2a2a35]">
        You have{" "}
        <strong className="font-bold text-amber-600">
          {creditCount} {creditCount === 1 ? "credit" : "credits"}
        </strong>{" "}
        remaining. You've been improving fast — grab more to keep the momentum.
      </div>

      <button
        onClick={handleClick}
        className="whitespace-nowrap rounded-lg bg-amber-600 px-[18px] py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
      >
        Buy Credits
      </button>
    </div>
  );
}
