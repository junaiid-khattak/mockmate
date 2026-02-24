import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "nayld.ai vs Final Round AI — Which AI Interview Prep Tool Is Better?",
  description:
    "Honest comparison of nayld.ai and Final Round AI. Compare features, pricing, fit scoring, mock interviews, and real-time assistance to choose the best tool for your interview prep.",
  keywords: [
    "nayld.ai vs Final Round AI",
    "Final Round AI alternative",
    "AI interview prep comparison",
    "best AI interview tool",
  ],
  alternates: {
    canonical: "https://nayld.ai/compare/vs-final-round-ai",
  },
  openGraph: {
    title: "nayld.ai vs Final Round AI — Which AI Interview Prep Tool Is Better?",
    description:
      "Honest comparison of nayld.ai and Final Round AI for AI-powered interview preparation.",
    url: "https://nayld.ai/compare/vs-final-round-ai",
    siteName: "nayld.ai",
    type: "article",
  },
};

const comparisonRows = [
  {
    feature: "Resume-Job Fit Score",
    nayld: "Yes (1-10 with detailed gap analysis)",
    finalRound: "No",
    naybetter: true,
  },
  {
    feature: "AI Mock Interviews",
    nayld: "Yes (tailored to job + resume)",
    finalRound: "Yes",
    naybetter: null,
  },
  {
    feature: "Tailored Questions",
    nayld: "Yes (from fit analysis)",
    finalRound: "Yes",
    naybetter: null,
  },
  {
    feature: "Free Tier",
    nayld: "Full analysis free, pay per mock",
    finalRound: "Limited free tier",
    naybetter: true,
  },
  {
    feature: "Pricing Model",
    nayld: "Pay-per-interview credits ($10+)",
    finalRound: "Subscription required",
    naybetter: true,
  },
  {
    feature: "Live Interview Copilot",
    nayld: "No (focused on preparation)",
    finalRound: "Yes (real-time assistance)",
    naybetter: false,
  },
  {
    feature: "Weakness Assessment",
    nayld: "Yes (detailed post-mock)",
    finalRound: "Yes",
    naybetter: null,
  },
  {
    feature: "Credits Expire",
    nayld: "Never",
    finalRound: "N/A (subscription)",
    naybetter: true,
  },
];

export default function VsFinalRoundPage() {
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

      {/* Article */}
      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Link href="/compare" className="text-sm text-mm-violet hover:underline mb-4 inline-block">
            ← All Comparisons
          </Link>

          <Badge variant="outline" className="mb-4 text-xs">
            Honest Comparison
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            nayld.ai vs Final Round AI
          </h1>

          <p className="text-lg text-slate-600">
            Both nayld.ai and Final Round AI help you prepare for interviews with AI-powered practice, but they take
            fundamentally different approaches. Here's an honest breakdown so you can choose the right tool for your
            needs.
          </p>
        </div>

        {/* Key Difference Callout */}
        <Card className="border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">The Core Difference</h2>
            <p className="text-slate-600">
              <strong className="text-slate-900">nayld.ai</strong> focuses on{" "}
              <strong className="text-mm-violet">pre-interview preparation</strong> — analyzing your fit, identifying
              weaknesses, and practicing targeted questions before your interview.
            </p>
            <p className="text-slate-600 mt-3">
              <strong className="text-slate-900">Final Round AI</strong> focuses on{" "}
              <strong className="text-purple-600">real-time assistance</strong> — providing an AI copilot that helps
              you during your actual interview with live suggestions and transcription.
            </p>
          </CardContent>
        </Card>

        {/* Feature Comparison Table */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">Feature</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">nayld.ai</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">Final Round AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-900">{row.feature}</td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        {row.naybetter === true && <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                        {row.naybetter === false && <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />}
                        <span>{row.nayld}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        {row.naybetter === false && <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                        {row.naybetter === true && <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />}
                        <span>{row.finalRound}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* When to Choose nayld.ai */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When to Choose nayld.ai</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You want to know if you're a good fit before investing time in prep
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      The{" "}
                      <Link href="/resume-fit-score" className="text-mm-violet hover:underline">
                        1-10 fit score
                      </Link>{" "}
                      and gap analysis tell you exactly where you stand and what to focus on.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You want targeted prep focused on your weak spots</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Mock interview questions are generated from the intersection of YOUR resume and the specific job,
                      focusing on areas where you're weakest.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You don't want a subscription commitment</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Pay-per-interview credits mean you only pay when you actually need to practice. Credits never
                      expire, so buy once and use whenever.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You want free analysis before paying anything</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Resume analysis, fit scoring, gap analysis, and tailored questions are completely free. You only
                      pay for actual mock interview sessions.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* When to Choose Final Round AI */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When to Choose Final Round AI</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You want real-time assistance during your actual interview
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Final Round AI's live copilot can transcribe the interview and suggest answers in real-time —
                      something nayld.ai doesn't offer (we focus on preparation, not live assistance).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You're comfortable with a subscription model</p>
                    <p className="text-sm text-slate-600 mt-1">
                      If you prefer predictable monthly costs and will use the tool regularly across multiple
                      interviews, a subscription might make sense for you.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Pricing Comparison</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-mm-violet/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">nayld.ai</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">Free:</p>
                    <p className="text-sm text-slate-600">
                      Resume analysis, fit scoring, gap analysis, tailored questions
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Paid:</p>
                    <p className="text-sm text-slate-600">$10/credit (1 mock interview session)</p>
                    <p className="text-sm text-slate-600">Credits never expire, no subscription</p>
                  </div>
                </div>
                <Link href="/pricing" className="text-sm text-mm-violet hover:underline mt-4 inline-block">
                  View full pricing →
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Final Round AI</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">Model:</p>
                    <p className="text-sm text-slate-600">Subscription-based</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Note:</p>
                    <p className="text-sm text-slate-600">
                      Includes access to live interview copilot and mock interview features
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Check their website for current pricing (we don't want to misrepresent their rates)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Bottom Line</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                <strong className="text-slate-900">Choose nayld.ai</strong> if you want to focus on{" "}
                <strong className="text-mm-violet">preparation before the interview</strong> — understanding your fit,
                identifying gaps, and practicing targeted questions without a subscription commitment.
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-900">Choose Final Round AI</strong> if you want{" "}
                <strong className="text-purple-600">real-time assistance during the actual interview</strong> itself,
                with live transcription and AI suggestions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Try nayld.ai Free</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Get your free resume analysis and{" "}
            <Link href="/resume-fit-score" className="text-mm-violet hover:underline">
              fit score
            </Link>
            . See exactly how you match the jobs you're targeting before deciding to practice. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free
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
            <Link href="/blog" className="hover:text-slate-900">
              Blog
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
