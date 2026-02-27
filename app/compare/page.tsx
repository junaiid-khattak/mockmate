import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Zap, MessageSquare } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "nayld.ai vs Other AI Interview Tools — Comparison",
  description:
    "See how nayld.ai compares to Final Round AI, Interviewing.io, ChatGPT, and other AI interview prep tools. Compare features, pricing, and approaches to find the best fit for your interview preparation.",
  keywords: [
    "nayld.ai vs Final Round AI",
    "best AI interview prep tool",
    "AI interview tools comparison",
    "interview preparation software comparison",
  ],
  alternates: {
    canonical: "https://nayld.ai/compare",
  },
  openGraph: {
    title: "nayld.ai vs Other AI Interview Tools — Comparison",
    description:
      "See how nayld.ai compares to Final Round AI, Interviewing.io, ChatGPT, and other AI interview prep tools.",
    url: "https://nayld.ai/compare",
    siteName: "nayld.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nayld.ai vs Other AI Interview Tools — Comparison",
    description:
      "See how nayld.ai compares to Final Round AI, Interviewing.io, ChatGPT, and other AI interview prep tools.",
  },
};

const comparisons = [
  {
    slug: "vs-final-round-ai",
    competitor: "Final Round AI",
    icon: Target,
    description: "AI interview copilot with real-time assistance vs focused pre-interview preparation",
    available: true,
  },
  {
    slug: "vs-interviewing-io",
    competitor: "Interviewing.io",
    icon: Zap,
    description: "Live human practice interviews vs AI-powered mock interviews tailored to your resume",
    available: false,
  },
  {
    slug: "vs-chatgpt",
    competitor: "ChatGPT for Interview Prep",
    icon: MessageSquare,
    description: "Generic AI chat vs specialized interview prep with fit scoring and structured assessments",
    available: false,
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 text-xs">
            Comparisons
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            How nayld.ai Compares to Other AI Interview Prep Tools
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            We believe in transparency. Here's how nayld.ai stacks up against other popular AI interview preparation
            platforms — the honest comparison you won't find on their sites.
          </p>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comparison) => {
            const Icon = comparison.icon;
            return (
              <Card
                key={comparison.slug}
                className={`border-slate-200 ${
                  comparison.available ? "hover:border-mm-violet/20 transition-colors" : "opacity-75"
                }`}
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    {comparison.available ? (
                      <Link
                        href={`/compare/${comparison.slug}`}
                        className="hover:text-mm-violet transition-colors"
                      >
                        nayld.ai vs {comparison.competitor}
                      </Link>
                    ) : (
                      <span>nayld.ai vs {comparison.competitor}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{comparison.description}</p>
                  {comparison.available ? (
                    <Link href={`/compare/${comparison.slug}`}>
                      <Button variant="ghost" className="gap-2 px-0">
                        Read comparison
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-mm-violet to-purple-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Try nayld.ai?</h2>
          <p className="mt-4 text-lg text-purple-100">
            Get your free resume analysis and fit score. See exactly how you match the jobs you're targeting — no
            credit card required.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link href="/" className="text-xl font-bold gradient-text">
            nayld.ai
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
            <Link href="/resume-fit-score" className="hover:text-slate-900">
              Resume Fit Score
            </Link>
            <Link href="/ai-mock-interviews" className="hover:text-slate-900">
              AI Mock Interviews
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
