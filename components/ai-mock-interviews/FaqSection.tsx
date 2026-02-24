"use client";

import { Accordion } from "@/components/ui/accordion";
import { faqs } from "./faq-data";

export function FaqSection() {
  const accordionItems = faqs.map((faq, idx) => ({
    id: `faq-${idx}`,
    title: faq.question,
    content: faq.answer,
  }));

  return <Accordion items={accordionItems} type="single" className="mt-12" />;
}
