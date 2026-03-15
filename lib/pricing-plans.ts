import type { Plan } from "@/components/landing/pricing-card";

export const pricingPlans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Try nayld.ai with a full mock interview.",
    features: [
      "1 AI mock interview",
      "Standard AI Interviewer",
      "Full 10-metric performance scoring",
      "Personalized feedback report",
    ],
    cta: "Sign Up Free",
  },
  {
    name: "Essentials",
    price: "$20",
    priceLabel: "/month",
    description: "Everything you need for consistent interview practice.",
    features: [
      "10 AI mock interviews per month",
      "Standard AI Interviewer",
      "Full 10-metric performance scoring",
      "Personalized feedback report",
      "Buy extra interviews at $3 each",
      "Cancel anytime",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$69",
    priceLabel: "/month",
    description: "The most realistic AI interview experience available.",
    features: [
      "10 AI mock interviews per month",
      "Premium AI Interviewer",
      "Faster, more natural responses",
      "Human-like conversation flow",
      "Deepest contextual follow-ups",
      "Full 10-metric performance scoring",
      "Personalized feedback report",
      "Buy extra interviews at $10 each",
      "Cancel anytime",
    ],
    cta: "Subscribe",
    popular: true,
    premiumCallout:
      "The closest thing to a real interviewer — faster responses, more natural conversation, and deeper contextual follow-ups.",
  },
];
