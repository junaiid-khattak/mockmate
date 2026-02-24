"use client";

import { PricingCard } from "@/components/landing/pricing-card";
import { pricingPlans } from "@/lib/pricing-plans";
import { useRouter } from "next/navigation";

export function PricingGrid() {
  const router = useRouter();

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {pricingPlans.map((plan, idx) => (
        <PricingCard
          key={idx}
          plan={plan}
          onCta={() => {
            router.push("/signup");
          }}
        />
      ))}
    </div>
  );
}
