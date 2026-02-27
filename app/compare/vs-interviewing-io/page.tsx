import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "nayld.ai vs Interviewing.io — Comparison Coming Soon",
  description:
    "Detailed comparison of nayld.ai and Interviewing.io for interview preparation. Compare AI mock interviews vs live human practice interviews.",
  alternates: {
    canonical: "https://nayld.ai/compare/vs-interviewing-io",
  },
  openGraph: {
    title: "nayld.ai vs Interviewing.io — Comparison Coming Soon",
    description:
      "Detailed comparison of nayld.ai and Interviewing.io for interview preparation. Compare AI mock interviews vs live human practice interviews.",
    url: "https://nayld.ai/compare/vs-interviewing-io",
    siteName: "nayld.ai",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "nayld.ai vs Interviewing.io — Comparison Coming Soon",
    description:
      "Detailed comparison of nayld.ai and Interviewing.io for interview preparation.",
  },
};

export default function VsInterviewingIoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <PublicHeader />

      {/* Content */}
      <article className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Breadcrumbs
          items={[{ label: "Compare", href: "/compare" }, { label: "vs Interviewing.io" }]}
          className="mb-6 text-left"
        />

        <Badge variant="outline" className="mb-4 text-xs">
          Coming Soon
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
          nayld.ai vs Interviewing.io
        </h1>

        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          We're working on a detailed comparison of nayld.ai and Interviewing.io. This page will compare AI-powered
          mock interviews vs live human practice interviews, pricing models, and when to choose each platform.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/compare">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              View Other Comparisons
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="gap-2">
              Try nayld.ai Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 mt-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link href="/" className="text-xl font-bold gradient-text">
            nayld.ai
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/compare" className="hover:text-slate-900">
              Comparisons
            </Link>
            <Link href="/pricing" className="hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
