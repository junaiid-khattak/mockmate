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
    title: "nayld.ai vs Huru AI — Best AI Interview Prep Tool in 2026?",
    description:
        "Compare nayld.ai vs Huru AI for interview preparation. See differences in resume-job fit scoring, tailored mock interviews, pricing, feedback, and who each tool is best for.",
    keywords: [
        "nayld.ai vs Huru AI",
        "Huru AI alternative",
        "best AI interview prep tool",
        "AI mock interview comparison",
        "resume fit score tool",
        "job specific interview prep",
        "Huru AI vs nayld.ai",
    ],
    alternates: {
        canonical: "https://nayld.ai/compare/vs-huru-ai",
    },
    openGraph: {
        title: "nayld.ai vs Huru AI — Best AI Interview Prep Tool in 2026?",
        description:
            "Honest comparison of nayld.ai and Huru AI. Compare fit scoring, mock interviews, pricing, and interview feedback.",
        url: "https://nayld.ai/compare/vs-huru-ai",
        siteName: "nayld.ai",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "nayld.ai vs Huru AI — Best AI Interview Prep Tool in 2026?",
        description:
            "Compare nayld.ai and Huru AI for AI-powered interview preparation.",
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
        feature: "Job-Specific Mock Interviews",
        nayld: "Yes (generated from your resume + the exact job)",
        competitor: "Yes (custom interviews from job posts)",
        naybetter: true,
    },
    {
        feature: "Tailored Questions from Weak Spots",
        nayld: "Yes (questions based on your missing skills and weak areas)",
        competitor: "Limited",
        naybetter: true,
    },
    {
        feature: "General Mock Interview Practice",
        nayld: "Yes",
        competitor: "Yes",
        naybetter: null,
    },
    {
        feature: "Instant Feedback",
        nayld: "Yes (post-mock interview analysis)",
        competitor: "Yes",
        naybetter: null,
    },
    {
        feature: "Body Language / Delivery Feedback",
        nayld: "Focused more on answer quality and job fit",
        competitor: "Yes",
        naybetter: false,
    },
    {
        feature: "Free Value Before Paying",
        nayld: "High (free fit score, gap analysis, tailored questions)",
        competitor: "Free trial / limited free use",
        naybetter: true,
    },
    {
        feature: "Pricing Model",
        nayld: "Pay per mock interview credit",
        competitor: "Subscription",
        naybetter: true,
    },
    {
        feature: "Best For",
        nayld: "Serious, targeted prep for a specific role",
        competitor: "Frequent broad interview practice",
        naybetter: true,
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "What is the difference between nayld.ai and Huru AI?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "nayld.ai is built around resume-job fit scoring, gap analysis, and targeted mock interviews based on your exact resume and job description. Huru AI is more focused on broad mock interview practice with instant feedback and repeated rehearsal.",
            },
        },
        {
            "@type": "Question",
            name: "Is nayld.ai a good Huru AI alternative?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. nayld.ai is a strong Huru AI alternative if you want more targeted interview prep, clearer insight into whether you match a role, and a pay-per-use pricing model instead of a subscription.",
            },
        },
        {
            "@type": "Question",
            name: "Which is better for job-specific interview prep?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "nayld.ai is better for job-specific interview prep because it analyzes your resume against a job description, highlights gaps, and turns those gaps into focused interview practice.",
            },
        },
        {
            "@type": "Question",
            name: "Which is better for unlimited mock interviews?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Huru AI is the better choice if your main goal is frequent general mock interview practice through a subscription model.",
            },
        },
    ],
};

export default function VsHuruAiPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <Script
                id="faq-schema-vs-huru-ai"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <PublicHeader />

            <article className="mx-auto max-w-4xl px-6 py-16">
                <div className="mb-8">
                    <Breadcrumbs
                        items={[{ label: "Compare", href: "/compare" }, { label: "vs Huru AI" }]}
                        className="mb-6"
                    />

                    <Badge variant="outline" className="mb-4 text-xs">
                        Honest Comparison
                    </Badge>

                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        nayld.ai vs Huru AI
                    </h1>

                    <p className="text-lg text-slate-600">
                        Looking for the best AI interview prep tool? Both nayld.ai and Huru AI help you
                        practice interviews with AI, but they solve different problems. This guide breaks
                        down features, pricing, and who each tool is best for so you can choose the right one.
                    </p>
                </div>

                <Card className="mb-12 border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50">
                    <CardContent className="p-6">
                        <h2 className="mb-3 text-xl font-bold text-slate-900">The Core Difference</h2>

                        <p className="text-slate-600">
                            <strong className="text-slate-900">nayld.ai</strong> is built for{" "}
                            <strong className="text-mm-violet">targeted pre-interview preparation</strong>.
                            It tells you how well your resume matches a job, shows where you are weak, and
                            turns those weak spots into focused mock interview practice.
                        </p>

                        <p className="mt-3 text-slate-600">
                            <strong className="text-slate-900">Huru AI</strong> is stronger for{" "}
                            <strong className="text-purple-600">high-volume mock interview repetition</strong>.
                            It emphasizes broad interview practice, instant feedback, and repeated rehearsal
                            across many roles and scenarios.
                        </p>
                    </CardContent>
                </Card>

                <div className="mb-12">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">Feature Comparison</h2>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">nayld.ai</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">Huru AI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-4 font-medium text-slate-900">{row.feature}</td>

                                        <td className="px-4 py-4 text-slate-600">
                                            <div className="flex items-start gap-2">
                                                {row.naybetter === true && (
                                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                                )}
                                                {row.naybetter === false && (
                                                    <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                                                )}
                                                <span>{row.nayld}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            <div className="flex items-start gap-2">
                                                {row.naybetter === false && (
                                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                                )}
                                                {row.naybetter === true && (
                                                    <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
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
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">Why nayld.ai Is Better for Serious Interview Prep</h2>
                    <Card className="border-slate-200">
                        <CardContent className="p-6">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            You find out whether you are actually a strong fit before you start grinding mocks
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Instead of just practicing endlessly, nayld.ai helps you understand how your
                                            resume stacks up against the exact role you want.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            Your mock interviews are shaped by your actual weaknesses
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Questions are generated from the intersection of your resume and the job
                                            description, so you practice what matters most instead of doing generic drills.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            You get a lot of value before you ever pay
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Fit score, tailored questions, and gap analysis help you decide whether
                                            interview practice is even worth doing for a role.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            No subscription pressure
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Buy interview credits only when you need them. That makes more sense for most
                                            job seekers than another recurring monthly bill.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-12">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">When Huru AI Might Be Better</h2>
                    <Card className="border-slate-200">
                        <CardContent className="p-6">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            You want a lot of practice sessions every week
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            If your strategy is repetition, repetition, repetition, Huru AI’s subscription
                                            model may fit that style better.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            You care a lot about delivery feedback
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Huru AI puts more emphasis on practice feedback around communication,
                                            pacing, and delivery.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            You want broad interview prep across many possible roles
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Huru AI is a good choice if you are exploring multiple paths and want general
                                            interview coaching rather than precise role-by-role fit analysis.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-12">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">Pricing Comparison</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-2 border-mm-violet/20">
                            <CardContent className="p-6">
                                <h3 className="mb-3 text-xl font-bold text-slate-900">nayld.ai</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">Free:</p>
                                        <p className="text-sm text-slate-600">
                                            Resume analysis, fit score, gap analysis, and tailored interview questions
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Paid:</p>
                                        <p className="text-sm text-slate-600">
                                            Pay per mock interview credit
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            No subscription, no pressure, and credits never expire
                                        </p>
                                    </div>
                                </div>

                                <Link href="/pricing" className="mt-4 inline-block text-sm text-mm-violet hover:underline">
                                    View full pricing →
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="p-6">
                                <h3 className="mb-3 text-xl font-bold text-slate-900">Huru AI</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">Model:</p>
                                        <p className="text-sm text-slate-600">Subscription-based with a free trial</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Best for:</p>
                                        <p className="text-sm text-slate-600">
                                            Users who want unlimited, repeated mock interview practice
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-slate-500">
                                    Check their website for the latest pricing and plan details so rates are not misrepresented.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">Bottom Line</h2>
                    <Card className="border-slate-200">
                        <CardContent className="p-6">
                            <p className="mb-4 text-slate-600">
                                <strong className="text-slate-900">Choose nayld.ai</strong> if you want{" "}
                                <strong className="text-mm-violet">smarter, more targeted interview prep</strong>.
                                It helps you understand whether you fit a role, where you are weak, and what to
                                practice next.
                            </p>

                            <p className="text-slate-600">
                                <strong className="text-slate-900">Choose Huru AI</strong> if you want{" "}
                                <strong className="text-purple-600">high-frequency general mock interview practice</strong>
                                and prefer a subscription model built around repeated rehearsal.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-12">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        <Card className="border-slate-200">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900">Is nayld.ai a better Huru AI alternative?</h3>
                                <p className="mt-2 text-slate-600">
                                    It is if you care more about job-specific preparation than generic repetition.
                                    nayld.ai gives you role fit analysis and targeted interview practice instead of
                                    just more mocks.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900">Does Huru AI offer unlimited mock interviews?</h3>
                                <p className="mt-2 text-slate-600">
                                    Yes, that is one of its main selling points. If you want unlimited practice,
                                    Huru AI has an advantage there.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900">What makes nayld.ai different from other AI interview tools?</h3>
                                <p className="mt-2 text-slate-600">
                                    The biggest difference is that nayld.ai starts with fit. Before you spend time
                                    practicing, it shows how well your resume matches the job and what gaps could
                                    hurt your chances.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-mm-violet/20 bg-gradient-to-br from-mm-violet/5 to-purple-50 p-8 text-center">
                    <h2 className="mb-3 text-2xl font-bold text-slate-900">Try nayld.ai Free</h2>
                    <p className="mx-auto mb-6 max-w-xl text-slate-600">
                        Get your free resume analysis and fit score before spending money on interview prep.
                        See where you stand, identify your gaps, and practice smarter.
                    </p>

                    <Link href="/signup">
                        <Button size="lg" className="gap-2">
                            Get Started Free
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </article>

            <footer className="mt-16 border-t border-slate-100 bg-white py-8">
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