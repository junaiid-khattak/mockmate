import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Upload, Briefcase, BarChart3, CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/landing/section-title";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { FaqSection } from "@/components/resume-fit-score/FaqSection";
import { faqs } from "@/components/resume-fit-score/faq-data";

export const metadata: Metadata = {
  title: "Resume Fit Score — See How Well You Match Any Job | nayld.ai",
  description:
    "Upload your resume and a job posting to get an instant 1-10 fit score with gap analysis. Know your strengths, weak spots, and predicted interview focus areas — free.",
  keywords: [
    "resume fit score",
    "resume match score",
    "how well does my resume match a job",
    "resume job match analysis",
    "resume compatibility score",
    "job fit analysis",
    "resume gap analysis",
  ],
  alternates: {
    canonical: "https://nayld.ai/resume-fit-score",
  },
  openGraph: {
    title: "Resume Fit Score — See How Well You Match Any Job | nayld.ai",
    description:
      "Upload your resume and a job posting to get an instant 1-10 fit score with gap analysis. Know your strengths, weak spots, and predicted interview focus areas — free.",
    url: "https://nayld.ai/resume-fit-score",
    siteName: "nayld.ai",
    type: "website",
  },
};

const testimonials = [
  {
    quote:
      "I went from bombing interviews to getting 3 offers in two weeks. The fit score showed me exactly where my resume fell short, and the mock interviews gave me the reps I needed.",
    name: "Sarah K.",
    role: "Product Manager",
    company: "Landed at Stripe",
  },
  {
    quote:
      "The tailored questions were scary accurate. My real interviewer asked almost the same things nayld.ai predicted. I felt like I had the answers before walking in.",
    name: "Marcus T.",
    role: "Senior Engineer",
    company: "Landed at Airbnb",
  },
  {
    quote:
      "Finally, honest feedback. The fit score told me I wasn't ready for that role, saved me a bad interview. I applied to better matches and landed one in a week.",
    name: "David L.",
    role: "Data Analyst",
    company: "Landed at Meta",
  },
];

const stats = [
  { value: "10,000+", label: "Resumes Analyzed" },
  { value: "95%", label: "Users Felt More Prepared" },
  { value: "2,400+", label: "Candidates Preparing" },
  { value: "8.4/10", label: "Average Fit Score" },
];

export default function ResumeFitScorePage() {
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
              Free Resume Analysis
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Resume Fit Score
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Upload your resume and a job posting to get an instant <strong>1-10 fit score</strong> with gap analysis.
              Know your strengths, weak spots, and predicted interview focus areas — in seconds.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Your Free Fit Score
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              No credit card required • Get your score in under 60 seconds
            </p>
          </div>

          {/* Visual Highlight */}
          <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Instant Analysis</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Get your fit score in under 60 seconds
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Deep Gap Analysis</h3>
                <p className="mt-2 text-sm text-slate-600">
                  See exactly where you're strong and where you need work
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Interview Prep Ready</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Get tailored questions to practice with our{" "}
                  <Link href="/ai-mock-interviews" className="text-mm-violet hover:underline">
                    AI mock interviews
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-slate-50/80 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="How It Works"
              title="Get Your Resume Fit Score in 3 Simple Steps"
              align="center"
            />

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    1
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Upload Your Resume</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Drop your PDF resume. Our AI instantly parses your skills, experience, and qualifications.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Add the Job Posting</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Paste the job URL or description. We analyze every requirement, skill, and qualification listed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Get Your 1-10 Score</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Receive your fit score, gap analysis, and tailored interview questions — all in under 60 seconds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="What You Get"
              title="More Than Just a Number — Complete Interview Prep"
              subtitle="Our resume fit score gives you everything you need to walk into your interview confident and prepared."
              align="center"
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">1-10 Fit Score</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    A clear, honest assessment of how well your background matches the role. No guessing — you'll know
                    exactly where you stand.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Strong Alignment Areas</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    See which parts of your resume align perfectly with the job. These are your talking points — lead
                    with these in your interview.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Weak Spots & Gaps</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Identify where your resume falls short. Prepare answers to address these gaps before the interviewer
                    even asks.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Predicted Interview Focus Areas</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Based on your fit score and gaps, we predict what the interviewer will focus on. Walk in knowing
                    what's coming.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 md:col-span-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Tailored Interview Questions</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Get AI-generated questions specific to this job and your background. Practice with our{" "}
                    <Link href="/ai-mock-interviews" className="text-mm-violet hover:underline font-medium">
                      AI mock interviews
                    </Link>{" "}
                    to nail your answers before the real thing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-slate-50/80 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Success Stories"
              title="Candidates Don't Just Feel Prepared — They Are Prepared"
              align="center"
            />

            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4 mb-14">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, idx) => (
                <TestimonialCard key={idx} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <SectionTitle
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              align="center"
            />

            <FaqSection />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-mm-violet to-purple-600 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Stop Guessing. Know Your Fit Score.
            </h2>
            <p className="mt-4 text-lg text-purple-100">
              Upload your resume and see how well you match any job — completely free. Get your 1-10 score, gap
              analysis, and tailored questions in under 60 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Your Free Fit Score
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-purple-200">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-white hover:underline">
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
              <Link href="/ai-mock-interviews" className="hover:text-slate-900">
                AI Mock Interviews
              </Link>
              <Link href="/pricing" className="hover:text-slate-900">
                Pricing
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
