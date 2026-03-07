import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Briefcase,
  BarChart3,
  Mic,
  CheckCircle2,
  Target,
  Zap,
  Users,
  Brain,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/landing/section-title";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { FaqSection } from "@/components/ai-mock-interviews/FaqSection";
import { faqs } from "@/components/ai-mock-interviews/faq-data";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "AI Mock Interviews — Practice with a Realistic AI Interviewer | nayld.ai",
  description:
    "Run AI-powered mock interviews tailored to your resume and the specific job you're targeting. Adaptive follow-ups, real pressure, and detailed assessments.",
  keywords: [
    "AI mock interview",
    "AI interview practice",
    "practice interview with AI",
    "AI interview coach",
    "mock interview AI",
    "AI job interview practice",
    "interview preparation AI",
  ],
  alternates: {
    canonical: "https://nayld.ai/ai-mock-interviews",
  },
  openGraph: {
    title: "AI Mock Interviews — Practice with a Realistic AI Interviewer | nayld.ai",
    description:
      "Run AI-powered mock interviews tailored to your resume and the specific job you're targeting. Adaptive follow-ups, real pressure, and detailed assessments.",
    url: "https://nayld.ai/ai-mock-interviews",
    siteName: "nayld.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mock Interviews — Practice with a Realistic AI Interviewer | nayld.ai",
    description:
      "Run AI-powered mock interviews tailored to your resume and the specific job you're targeting. Adaptive follow-ups, real pressure, and detailed assessments.",
  },
};

const testimonials = [
  {
    quote:
      "The tailored questions were scary accurate. My real interviewer asked almost the same things nayld.ai predicted. I felt like I had the answers before walking in.",
    name: "Marcus T.",
    role: "Senior Engineer",
    company: "Landed at Airbnb",
  },
  {
    quote:
      "I went from bombing interviews to getting 3 offers in two weeks. The mock interviews gave me the reps I needed and the feedback showed me exactly where I was weak.",
    name: "Sarah K.",
    role: "Product Manager",
    company: "Landed at Stripe",
  },
  {
    quote:
      "The adaptive follow-ups caught me off guard — just like a real interview. By the third mock session, I was ready for anything they threw at me.",
    name: "Jessica R.",
    role: "UX Designer",
    company: "Landed at Google",
  },
];

const stats = [
  { value: "10", label: "Performance Metrics", sub: "Scored every session" },
  { value: "Every Industry", label: "Tech to healthcare" },
  { value: "From $5", label: "Per Interview", sub: "Credits never expire" },
  { value: "30–45 min", label: "Per Session", sub: "Voice-based, AI-adapted" },
];

const targetAudiences = [
  {
    icon: Users,
    title: "Software Engineers",
    description: "Practice technical interviews, system design, and behavioral questions tailored to your stack.",
  },
  {
    icon: Brain,
    title: "Product Managers",
    description: "Prepare for product sense, strategy, and execution questions specific to the role and company.",
  },
  {
    icon: Target,
    title: "Designers",
    description: "Practice portfolio walkthroughs, design critiques, and collaboration scenarios.",
  },
  {
    icon: BarChart3,
    title: "Data Scientists",
    description: "Get ready for technical case studies, ML concepts, and data-driven decision questions.",
  },
  {
    icon: TrendingUp,
    title: "Career Switchers",
    description: "Address your gaps head-on and practice explaining your transition story with confidence.",
  },
  {
    icon: Shield,
    title: "Senior & Leadership Roles",
    description: "Prepare for high-level strategic questions, leadership scenarios, and culture fit assessments.",
  },
];

export default function AiMockInterviewsPage() {
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
        <PublicHeader />

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-xs">
              Tailored AI Interview Practice
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              AI Mock Interviews
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Practice with a realistic AI interviewer that asks questions tailored to{" "}
              <strong>your resume AND the specific job</strong> you're targeting — not generic question banks. Get
              adaptive follow-ups, real pressure, and detailed performance assessments.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Your First Mock Interview
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
              First{" "}
              <Link href="/resume-fit-score" className="text-mm-violet hover:underline font-medium">
                resume fit score
              </Link>{" "}
              and tailored questions are free • Mock interviews start at $10/credit
            </p>
          </div>

          {/* Visual Highlight */}
          <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Tailored to Your Resume</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Questions generated from YOUR experience and the specific job requirements
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Adaptive Follow-Ups</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Not scripted — the AI probes deeper based on your actual answers
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Detailed Assessments</h3>
                <p className="mt-2 text-sm text-slate-600">
                  After each session, see exactly where you're strong and where you need work
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
              title="From Resume Upload to Interview-Ready in Minutes"
              align="center"
            />

            <div className="mt-12 grid gap-8 md:grid-cols-5">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    1
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Upload Resume</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Drop your PDF resume — we parse your skills and experience instantly
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
                    <h3 className="font-semibold text-slate-900">Add Job Posting</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Paste the job URL or description — we analyze every requirement
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
                    <h3 className="font-semibold text-slate-900">Get Fit Score</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    See your 1-10 fit score, gaps, and predicted interview focus areas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    4
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <Mic className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Mock Interview</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Run a realistic AI mock interview with adaptive follow-up questions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mm-violet to-purple-600 text-white font-bold text-lg">
                    5
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-mm-violet" />
                    <h3 className="font-semibold text-slate-900">Get Assessment</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Receive detailed feedback on strengths, weaknesses, and what to improve
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Why nayld.ai"
              title="What Makes Our Mock Interviews Different"
              subtitle="We don't give you generic question banks. We build interviews around YOUR resume and the specific job you're targeting."
              align="center"
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Questions Tailored to YOU</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Every question is generated from the intersection of YOUR resume and the specific job requirements.
                    Not generic — questions that reflect what a real interviewer would ask based on your background and
                    the role.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Adaptive Follow-Up Probes</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Our AI doesn't follow a script. It listens to your answers and asks natural follow-up questions to
                    probe deeper — just like a real interviewer would. This creates realistic pressure and exposes weak
                    spots in your answers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Detailed Weakness Assessment</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    After each mock interview session, you get a breakdown of where you were strong, where you
                    struggled, and specific recommendations for improvement. No vague feedback — actionable insights on
                    exactly what to work on.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Focuses on Your Actual Gaps</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Based on your{" "}
                    <Link href="/resume-fit-score" className="text-mm-violet hover:underline font-medium">
                      resume fit score
                    </Link>
                    , we know where your resume falls short of the job requirements. The mock interview questions focus
                    on those gaps — so you're prepared to address them when the real interviewer asks.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="bg-slate-50/80 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Who It's For"
              title="Built for Every Role, Every Level"
              align="center"
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {targetAudiences.map((audience, idx) => {
                const Icon = audience.icon;
                return (
                  <Card key={idx} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-mm-violet to-purple-600">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-900">{audience.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{audience.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Callout */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-8 sm:p-12 text-center">
                <Badge variant="outline" className="mb-4 text-xs">
                  Simple, Transparent Pricing
                </Badge>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Analysis and Questions Are Free. <br />
                  Mock Interviews Start at $10.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                  Upload your resume, add a job posting, and get your{" "}
                  <Link href="/resume-fit-score" className="text-mm-violet hover:underline font-medium">
                    fit score
                  </Link>{" "}
                  with tailored questions — completely free. Each AI mock interview costs one credit starting at $10.
                  Credits never expire.
                </p>
                <div className="mt-8">
                  <Link href="/pricing">
                    <Button size="lg" className="gap-2">
                      View Full Pricing
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
            <SectionTitle eyebrow="FAQ" title="Frequently Asked Questions" align="center" />

            <FaqSection />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-mm-violet to-purple-600 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Stop Winging It. Practice Like the Real Thing.
            </h2>
            <p className="mt-4 text-lg text-purple-100">
              Run AI-powered mock interviews tailored to your resume and the specific job you're targeting. Get
              adaptive follow-ups, real pressure, and detailed assessments. Start preparing today.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Your First Mock Interview
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
              <Link href="/resume-fit-score" className="hover:text-slate-900">
                Resume Fit Score
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
