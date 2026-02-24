import type { Plan } from "@/components/landing/pricing-card";

export const pricingPlans: Plan[] = [
  {
    name: "Starter",
    price: "$10",
    description: "Try a single mock interview.",
    features: [
      "1 interview credit",
      "Full AI mock interview session",
      "Detailed performance assessment",
      "Credits never expire",
    ],
    cta: "Get Started",
  },
  {
    name: "Standard",
    price: "$25",
    description: "The sweet spot for active job seekers.",
    features: [
      "3 interview credits",
      "Save 17% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 3 Credits",
    highlighted: true,
    popular: true,
  },
  {
    name: "Pro",
    price: "$39",
    description: "Serious prep across multiple roles.",
    features: [
      "5 interview credits",
      "Save 22% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 5 Credits",
  },
  {
    name: "Power",
    price: "$69",
    description: "Interviewing across companies or roles.",
    features: [
      "10 interview credits",
      "Save 31% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 10 Credits",
  },
];
