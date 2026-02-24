import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "nayld.ai vs ChatGPT for Interview Prep — Comparison Coming Soon",
  description:
    "Detailed comparison of nayld.ai and ChatGPT for interview preparation. Compare specialized interview prep AI vs general-purpose AI chat.",
  alternates: {
    canonical: "https://nayld.ai/compare/vs-chatgpt",
  },
};

export default function VsChatGPTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">
            nayld.ai
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/compare" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              All Comparisons
            </Link>
            <Link href="/signup" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign Up
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Link href="/compare" className="text-sm text-mm-violet hover:underline mb-4 inline-block">
          ← All Comparisons
        </Link>

        <Badge variant="outline" className="mb-4 text-xs">
          Coming Soon
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
          nayld.ai vs ChatGPT for Interview Prep
        </h1>

        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          We're working on a detailed comparison of nayld.ai and using ChatGPT for interview preparation. This page
          will compare specialized interview prep with fit scoring vs generic AI chat, structured assessments vs
          freeform prompts, and when each makes sense.
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
