import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Upload, BarChart3, Mic, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/landing/section-title";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { FaqSection } from "@/components/pricing/FaqSection";
import { faqs } from "@/components/pricing/faq-data";
import { pricingPlans } from "@/lib/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing — AI Interview Prep Credits | nayld.ai",
  description:
    "Free resume analysis and fit scoring. AI mock interview credits from $10. No subscriptions — credits never expire.",
  keywords: [
    "AI mock interview pricing",
    "AI interview prep cost",
    "interview practice pricing",
    "AI interview coach cost",
    "mock interview price",
  ],
  alternates: {
    canonical: "https://nayld.ai/pricing",
  },
  openGraph: {
    title: "Pricing — AI Interview Prep Credits | nayld.ai",
    description:
      "Free resume analysis and fit scoring. AI mock interview credits from $10. No subscriptions — credits never expire.",
    url: "https://nayld.ai/pricing",
    siteName: "nayld.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — AI Interview Prep Credits | nayld.ai",
    description:
      "Free resume analysis and fit scoring. AI mock interview credits from $10. No subscriptions — credits never expire.",
  },
};

const freeFeatures = [
  {
    icon: Upload,
    title: "Resume Analysis",
    description: "Upload your resume and we parse your skills, experience, and qualifications instantly.",
  },
  {
    icon: BarChart3,
    title: "1-10 Fit Score",
    description: "See how well you match any job with a clear, honest assessment of your alignment.",
  },
  {
    icon: CheckCircle2,
    title: "Gap Analysis",
    description: "Identify where your resume is strong and where it falls short of job requirements.",
  },
  {
    icon: Sparkles,
    title: "Tailored Questions",
    description: "Get AI-generated interview questions specific to your resume and the job posting.",
  },
];

const creditFeatures = [
  {
    icon: Mic,
    title: "AI Mock Interview Session",
    description:
      "Run a full mock interview with adaptive follow-up questions that probe deeper based on your answers.",
  },
  {
    icon: BarChart3,
    title: "Performance Assessment",
    description:
      "Receive detailed feedback on your strengths, weaknesses, and specific recommendations for improvement.",
  },
];

export default function PricingPage() {
  // Product structured data for each pricing tier
  const priceValidUntil = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  )
    .toISOString()
    .split("T")[0];

  const productStructuredData = pricingPlans.map((plan) => {
    const priceValue = plan.price.replace("$", "");
    const creditsMatch = plan.features[0].match(/(\d+) interview credit/);
    const credits = creditsMatch ? creditsMatch[1] : "1";

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${plan.name} Plan - ${credits} Interview Credit${credits !== "1" ? "s" : ""}`,
      description: plan.description,
      brand: {
        "@type": "Brand",
        name: "nayld.ai",
      },
      offers: {
        "@type": "Offer",
        price: priceValue,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://nayld.ai/pricing",
        priceValidUntil,
      },
    };
  });

  // FAQPage structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {productStructuredData.map((data, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        {/* Header */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold gradient-text">
              nayld.ai
            </Link>
            <nav className="flex items-center gap-6">
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

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-xs">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">nayld.ai Pricing</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Free resume analysis and fit scoring. Pay only for{" "}
              <Link href="/ai-mock-interviews" className="text-mm-violet hover:underline font-medium">
                AI mock interview
              </Link>{" "}
              sessions when you need them. No subscriptions. Credits never expire.
            </p>
          </div>
        </section>

        {/* Free Forever Callout */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-green-600">Free Forever</Badge>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need to Start</h2>
                <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                  Get unlimited access to resume analysis,{" "}
                  <Link href="/resume-fit-score" className="text-mm-violet hover:underline font-medium">
                    fit scoring
                  </Link>
                  , gap analysis, and tailored interview questions — completely free. No credit card required.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {freeFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Credit Packs */}
        <section className="bg-slate-50/80 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Credit Packs"
              title="Pay Only for Mock Interview Sessions"
              subtitle="Each AI mock interview session costs one credit. Buy credits when you need them — they never expire."
              align="center"
            />

            <PricingGrid />

            <p className="mt-8 text-center text-sm text-slate-500">
              All plans include full AI mock interview sessions with adaptive follow-ups and detailed performance
              assessments.
            </p>
          </div>
        </section>

        {/* What's Included Breakdown */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="What's Included"
              title="Free vs Credits: What You Get"
              align="center"
            />

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Free Tier */}
              <Card className="border-2 border-green-500/20">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-green-600">Free Forever</Badge>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Analysis & Preparation</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Unlimited Resume Uploads</p>
                        <p className="text-sm text-slate-600">Parse skills, experience, and qualifications</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Unlimited Fit Score Analysis</p>
                        <p className="text-sm text-slate-600">See how well you match any job posting</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Unlimited Gap Analysis</p>
                        <p className="text-sm text-slate-600">Identify strengths and weaknesses vs job requirements</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Unlimited Tailored Questions</p>
                        <p className="text-sm text-slate-600">
                          AI-generated questions specific to your resume and the job
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Credit-Based Tier */}
              <Card className="border-2 border-mm-violet/20">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-gradient-to-r from-mm-violet to-purple-600">Requires Credit</Badge>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Mock Interview Sessions</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Each full mock interview session costs 1 credit. Credits start at $10 and never expire.
                  </p>
                  <ul className="space-y-4">
                    {creditFeatures.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 flex-shrink-0">
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{feature.title}</p>
                            <p className="text-sm text-slate-600">{feature.description}</p>
                          </div>
                        </li>
                      );
                    })}
                    <li className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 text-mm-violet flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Credits Never Expire</p>
                        <p className="text-sm text-slate-600">
                          Use them whenever you need to prepare — this week, next month, or next year
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-slate-50/80 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <SectionTitle eyebrow="FAQ" title="Frequently Asked Questions" align="center" />

            <FaqSection />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Ready to Ace Your Next Interview?</h2>
            <p className="mt-4 text-lg text-slate-600">
              Start with free resume analysis and fit scoring. Run{" "}
              <Link href="/ai-mock-interviews" className="text-mm-violet hover:underline font-medium">
                AI mock interviews
              </Link>{" "}
              when you're ready to practice. No subscriptions. Credits never expire.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/resume-fit-score">
                <Button size="lg" variant="outline">
                  Learn About Fit Score
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-mm-violet hover:underline font-medium">
                Sign in
              </Link>
            </p>
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
              <Link href="/resume-fit-score" className="hover:text-slate-900">
                Resume Fit Score
              </Link>
              <Link href="/ai-mock-interviews" className="hover:text-slate-900">
                AI Mock Interviews
              </Link>
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900">
                Terms
              </Link>
            </nav>

            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
