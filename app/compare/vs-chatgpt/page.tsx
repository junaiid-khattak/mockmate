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
  title: "nayld.ai vs ChatGPT — Which Is Better for Interview Prep?",
  description:
    "Compare nayld.ai vs ChatGPT for interview preparation. See the difference between a purpose-built interview prep platform and a general AI assistant for mock interviews, fit scoring, and targeted practice.",
  keywords: [
    "nayld.ai vs ChatGPT",
    "ChatGPT interview prep alternative",
    "best AI interview prep tool",
    "ChatGPT vs nayld.ai",
    "AI mock interview tool",
    "resume fit score tool",
  ],
  alternates: {
    canonical: "https://nayld.ai/compare/vs-chatgpt",
  },
  openGraph: {
    title: "nayld.ai vs ChatGPT — Which Is Better for Interview Prep?",
    description:
      "Compare nayld.ai and ChatGPT for interview preparation, mock interviews, fit scoring, and targeted practice.",
    url: "https://nayld.ai/compare/vs-chatgpt",
    siteName: "nayld.ai",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "nayld.ai vs ChatGPT — Which Is Better for Interview Prep?",
    description:
      "Compare nayld.ai and ChatGPT for AI-powered interview preparation.",
  },
};

const comparisonRows = [
  {
    feature: "Resume-Job Fit Score",
    nayld: "Yes (1-10 score with detailed gap analysis)",
    competitor: "Not built in",
    naybetter: true,
  },
  {
    feature: "Purpose-Built Interview Prep Workflow",
    nayld: "Yes",
    competitor: "No (general-purpose assistant)",
    naybetter: true,
  },
  {
    feature: "Job-Specific Mock Interviews",
    nayld: "Yes (generated from your resume + job description)",
    competitor: "Possible with prompting, but manual",
    naybetter: true,
  },
  {
    feature: "Tailored Questions from Your Weak Spots",
    nayld: "Yes",
    competitor: "Possible, but depends on prompt quality",
    naybetter: true,
  },
  {
    feature: "Structured Post-Mock Assessment",
    nayld: "Yes",
    competitor: "Possible, but inconsistent unless prompted well",
    naybetter: true,
  },
  {
    feature: "General Career Help",
    nayld: "Focused mostly on interview prep",
    competitor: "Excellent",
    naybetter: false,
  },
  {
    feature: "Flexibility Across Many Tasks",
    nayld: "Interview-focused",
    competitor: "Very high",
    naybetter: false,
  },
  {
    feature: "Best For",
    nayld: "Candidates preparing for a specific job interview",
    competitor: "People wanting a broad AI assistant for job search tasks",
    naybetter: true,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is nayld.ai better than ChatGPT for interview prep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "nayld.ai is better if your goal is targeted interview preparation for a specific job. It is purpose-built for fit scoring, gap analysis, tailored questions, and structured mock interviews. ChatGPT is broader and more flexible, but it is not a dedicated interview-prep platform.",
      },
    },
    {
      "@type": "Question",
      name: "Can ChatGPT help with interview preparation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ChatGPT can help with interview questions, job search support, resume work, and practice prompts. But the quality depends heavily on how you prompt it and how well you structure the workflow.",
      },
    },
    {
      "@type": "Question",
      name: "What makes nayld.ai different from ChatGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The biggest difference is specialization. nayld.ai is built specifically for interview preparation around a real resume and job description, while ChatGPT is a general AI assistant that can be adapted for interview prep but does not give you a dedicated fit-scoring and mock-interview workflow out of the box.",
      },
    },
  ],
};

export default function VsChatGPTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Script
        id="faq-schema-vs-chatgpt"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicHeader />

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <Breadcrumbs
            items={[{ label: "Compare", href: "/compare" }, { label: "vs ChatGPT" }]}
            className="mb-6"
          />

          <Badge variant="outline" className="mb-4 text-xs">
            Honest Comparison
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            nayld.ai vs ChatGPT
          </h1>

          <p className="text-lg text-slate-600">
            ChatGPT can absolutely help with interview preparation. But there is a big difference
            between a flexible general AI assistant and a purpose-built interview prep platform.
            This guide breaks down where nayld.ai beats ChatGPT, where ChatGPT is still stronger,
            and which one is right for your workflow.
          </p>
        </div>

        <Card className="border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">The Core Difference</h2>

            <p className="text-slate-600">
              <strong className="text-slate-900">nayld.ai</strong> is a{" "}
              <strong className="text-mm-violet">purpose-built interview prep platform</strong>.
              It is designed to analyze your resume against a real job description, identify gaps,
              generate tailored questions, and run structured mock interviews around the exact role
              you want.
            </p>

            <p className="text-slate-600 mt-3">
              <strong className="text-slate-900">ChatGPT</strong> is a{" "}
              <strong className="text-purple-600">general-purpose AI assistant</strong>. It can
              help with interview prep, job search planning, resumes, and practice prompts, but
              you usually have to design the workflow yourself.
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">ChatGPT</th>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why nayld.ai Is Better for Serious Interview Prep</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">It starts with fit, not just prompts</p>
                    <p className="text-sm text-slate-600 mt-1">
                      With nayld.ai, you do not have to manually explain the whole context every time.
                      The platform is built to evaluate your resume against the actual job first.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">The workflow is opinionated in the right way</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Instead of figuring out the right prompts, format, scoring method, and follow-up logic,
                      you get a dedicated flow: fit score, gap analysis, tailored questions, then mock practice.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">It is built for the exact moment before a real interview</p>
                    <p className="text-sm text-slate-600 mt-1">
                      nayld.ai is stronger when you have a real role, a real job description, and limited time
                      to prepare with precision.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Less prompt engineering, more signal</p>
                    <p className="text-sm text-slate-600 mt-1">
                      With ChatGPT, results depend a lot on how well you prompt. nayld.ai removes that burden
                      and turns interview prep into a clean, repeatable workflow.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When ChatGPT Might Be Better</h2>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You want one AI tool for many job-search tasks</p>
                    <p className="text-sm text-slate-600 mt-1">
                      ChatGPT is better if you want a broad assistant for cover letters, outreach, research,
                      resumes, interview prep, and general career planning all in one place.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">You like building your own workflow</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Power users who enjoy prompting, iterating, and designing their own prep system can get a lot of value out of ChatGPT.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Your needs go beyond interviews</p>
                    <p className="text-sm text-slate-600 mt-1">
                      ChatGPT shines when the problem is not just interview prep, but the whole job-search process.
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
                <strong className="text-mm-violet">a focused, purpose-built system for interview preparation</strong>.
                It is the better choice when you care about fit scoring, gap analysis, targeted mock interviews,
                and a clean workflow built around a specific job.
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-900">Choose ChatGPT</strong> if you want{" "}
                <strong className="text-purple-600">a flexible general AI assistant</strong> that can help across
                resumes, interview practice, job search planning, and more — and you do not mind doing more setup yourself.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">Can ChatGPT replace an interview prep platform?</h3>
                <p className="text-slate-600 mt-2">
                  It can help a lot, but it does not replace a purpose-built interview workflow. You still have to structure
                  the prompts, scoring, and practice flow yourself.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">Is ChatGPT good for mock interviews?</h3>
                <p className="text-slate-600 mt-2">
                  Yes, especially for flexible practice and brainstorming. But nayld.ai is stronger when you want targeted,
                  role-specific preparation tied directly to your resume and the job description.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900">What is the main advantage of nayld.ai over ChatGPT?</h3>
                <p className="text-slate-600 mt-2">
                  Specialization. nayld.ai reduces guesswork and turns interview prep into a structured, repeatable process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Try nayld.ai Free</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Get your free resume analysis and fit score, then practice with interview questions built around
            your actual resume and the job you want.
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
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/compare" className="hover:text-slate-900">Comparisons</Link>
            <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
          </nav>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}