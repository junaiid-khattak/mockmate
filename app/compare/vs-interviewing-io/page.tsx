import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, X } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "nayld.ai vs interviewing.io — Which Interview Prep Tool Is Better?",
  description:
    "Compare nayld.ai vs interviewing.io. See the difference between broad, job-specific AI interview prep and deep technical mock interviews for software engineers.",
  keywords: [
    "nayld.ai vs interviewing.io",
    "interviewing.io alternative",
    "best interview prep tool",
    "AI mock interview comparison",
    "technical interview prep alternative",
    "nayld.ai vs interviewing io",
  ],
  alternates: {
    canonical: "https://nayld.ai/compare/vs-interviewing-io",
  },
  openGraph: {
    title: "nayld.ai vs interviewing.io — Which Interview Prep Tool Is Better?",
    description:
      "Compare nayld.ai and interviewing.io for interview prep, mock interviews, role coverage, and job-specific practice.",
    url: "https://nayld.ai/compare/vs-interviewing-io",
    siteName: "nayld.ai",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "nayld.ai vs interviewing.io — Which Interview Prep Tool Is Better?",
    description:
      "Compare nayld.ai and interviewing.io for interview preparation.",
  },
};

const comparisonRows = [
  {
    feature: "Resume-Job Fit Score",
    nayld: "Yes (1-10 score with detailed gap analysis)",
    competitor: "No dedicated fit score",
    naybetter: true,
  },
  {
    feature: "Best For",
    nayld: "Job-specific prep for any role",
    competitor: "Technical interview prep for software engineers",
    naybetter: true,
  },
  {
    feature: "Role Coverage",
    nayld: "Broad (tech and non-tech roles)",
    competitor: "Strongest for coding, system design, ML, and technical behavioral interviews",
    naybetter: true,
  },
  {
    feature: "Job-Specific Question Generation",
    nayld: "Yes (from resume + job description)",
    competitor: "Less centered on resume-job fit analysis",
    naybetter: true,
  },
  {
    feature: "Coding Interview Practice",
    nayld: "Not the primary focus",
    competitor: "Excellent",
    naybetter: false,
  },
  {
    feature: "System Design Practice",
    nayld: "Not the core use case",
    competitor: "Excellent",
    naybetter: false,
  },
  {
    feature: "Human Mock Interviews",
    nayld: "AI-first workflow",
    competitor: "Yes (with senior engineers from top companies)",
    naybetter: false,
  },
  {
    feature: "Fast, Lightweight Prep Before a Real Interview",
    nayld: "Excellent",
    competitor: "Heavier workflow",
    naybetter: true,
  },
  {
    feature: "Tailored Questions from Your Weak Spots",
    nayld: "Yes",
    competitor: "Less explicit",
    naybetter: true,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is nayld.ai a good interviewing.io alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, especially if you want broad, job-specific interview prep rather than deep technical interview simulation. nayld.ai is better for candidates who want resume-job fit scoring, gap analysis, and targeted mock interviews for a specific role.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between nayld.ai and interviewing.io?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "nayld.ai focuses on targeted interview preparation for a real job by analyzing your resume against the job description and generating practice around your weak spots. interviewing.io is strongest for technical interview preparation, especially coding and system design, with mock interviews led by experienced engineers.",
      },
    },
    {
      "@type": "Question",
      name: "Which one is better for software engineering interviews?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If your main goal is practicing coding and system design interviews in a highly technical environment, interviewing.io is likely the better choice. If you want broader prep, fit scoring, and role-specific interview practice around the actual job you are targeting, nayld.ai is the better choice.",
      },
    },
  ],
};

export default function VsInterviewingIoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Script
        id="faq-schema-vs-interviewing-io"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicHeader />

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Breadcrumbs
            items={[{ label: "Compare", href: "/compare" }, { label: "vs interviewing.io" }]}
            className="mb-6"
          />

          <Badge variant="outline" className="mb-4 text-xs">
            Honest Comparison
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            nayld.ai vs interviewing.io
          </h1>

          <p className="text-lg text-slate-600">
            Both nayld.ai and interviewing.io help candidates prepare for interviews, but they are built
            for very different prep styles. interviewing.io is strongest for high-realism technical interview
            practice, especially for software engineers. nayld.ai is better for fast, job-specific preparation
            driven by resume-job fit, gap analysis, and targeted mock interviews for a much wider range of roles.
          </p>
        </div>

        <Card className="border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">The Core Difference</h2>

            <p className="text-slate-600">
              <strong className="text-slate-900">nayld.ai</strong> focuses on{" "}
              <strong className="text-mm-violet">targeted preparation before the interview</strong>.
              It helps you understand how well your resume matches a specific job, shows your weak spots,
              and turns those gaps into focused practice questions and mock interview sessions.
            </p>

            <p className="text-slate-600 mt-3">
              <strong className="text-slate-900">interviewing.io</strong> focuses on{" "}
              <strong className="text-purple-600">technical interview realism</strong>, especially for
              software engineers practicing coding, system design, machine learning, and technical behavioral interviews.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Feature Comparison</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">Feature</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">nayld.ai</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">interviewing.io</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-900">{row.feature}</td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        {row.naybetter === true && (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        {row.naybetter === false && (
                          <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{row.nayld}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        {row.naybetter === false && (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        {row.naybetter === true && (
                          <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{row.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why nayld.ai Is Better for Broader, Faster Interview Prep</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      It works for more than just technical software interviews
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      If you are interviewing for product, operations, marketing, design, customer success,
                      business roles, or general non-LeetCode style interviews, nayld.ai is a more natural fit.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You get role fit analysis before you start practicing
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      That means you are not just practicing hard — you are practicing the exact areas
                      where your resume and the job description do not fully match.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      It is better for fast preparation around a specific job
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      nayld.ai is ideal when your interview is coming up and you want to get to the highest-impact prep quickly
                      without committing to a heavier technical mock interview workflow.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      It is more approachable for candidates who do not need FAANG-style technical prep
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      interviewing.io is excellent at what it does, but many candidates simply need better answers,
                      stronger stories, and clearer job alignment rather than deep coding interview simulation.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When interviewing.io Might Be Better</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You are preparing for coding interviews
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      If your main challenge is LeetCode-style coding rounds, interviewing.io is one of the stronger options in the market.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You want human mock interviews with experienced engineers
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      interviewing.io stands out if you want realistic technical mock interviews led by engineers
                      who have conducted hiring interviews at top companies.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">
                      You care about deep system design and technical drill practice
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      This is where interviewing.io has the clearest advantage.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Bottom Line</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                <strong className="text-slate-900">Choose nayld.ai</strong> if you want{" "}
                <strong className="text-mm-violet">fast, targeted interview preparation for a specific job</strong>,
                especially if you want resume-job fit scoring, tailored questions, and mock interviews that work across
                a wider range of roles — not just technical software interviews.
              </p>

              <p className="text-slate-600">
                <strong className="text-slate-900">Choose interviewing.io</strong> if you want{" "}
                <strong className="text-purple-600">deep technical interview practice</strong>,
                especially for coding, system design, and high-realism software engineering interview preparation.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">
                  Is interviewing.io only for software engineers?
                </h3>
                <p className="text-slate-600 mt-2">
                  That is where it is strongest. Its main public positioning is around coding, system design,
                  machine learning, and technical interview practice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">
                  Is nayld.ai better for non-technical roles?
                </h3>
                <p className="text-slate-600 mt-2">
                  Yes. If you are preparing for a broad range of interviews outside deep coding rounds,
                  nayld.ai is usually the better fit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">
                  Can software engineers still use nayld.ai?
                </h3>
                <p className="text-slate-600 mt-2">
                  Absolutely. It is especially useful for the behavioral, resume-alignment, and job-specific prep side
                  of software engineering interviews, even if you use another tool for pure coding rounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Try nayld.ai Free</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Start with your free resume analysis and fit score, then practice the interview questions
            most likely to matter for the exact role you want.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>

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