"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Menu,
  Mic,
  Shield,
  Target,
  TrendingUp,
  Upload,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { NayldLogo } from "@/components/NayldLogo";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion } from "@/components/ui/accordion";
import { SectionTitle } from "@/components/landing/section-title";
import { PricingCard, type Plan } from "@/components/landing/pricing-card";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { InterviewScreenMockup } from "@/components/landing/interview-screen-mockup";
import { ResultsDashboardMockup } from "@/components/landing/results-dashboard-mockup";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type LandingPageProps = { onPrimaryCta?: () => void };

type NavItem = { label: string; href: string };
const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Fit Score", href: "/resume-fit-score" },
  { label: "Mock Interviews", href: "/ai-mock-interviews" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Upload your resume & paste the job posting",
    description:
      "Free, takes 30 seconds. Drop your PDF and paste the job URL or description — our AI parses everything instantly.",
    icon: Upload,
    badge: "Free",
    highlight: false,
  },
  {
    number: "02",
    title: "Get your free fit score and tailored questions",
    description:
      "Instant analysis — see exactly how well you match the role and get questions generated from your specific resume and this job.",
    icon: BarChart3,
    badge: "Free",
    highlight: false,
  },
  {
    number: "03",
    title: "Practice with an AI mock interview",
    description:
      "Your AI interviewer adapts in real-time, challenges your weak spots, and gives you a detailed performance assessment scored across 10 metrics.",
    icon: Mic,
    badge: "Credits from $10",
    highlight: true,
  },
];

const scoringMetrics = [
  {
    label: "Question Understanding",
    description: "Does your answer actually address what was asked?",
    icon: Brain,
  },
  {
    label: "Communication Clarity",
    description: "How clearly and directly you communicate your points",
    icon: Mic,
  },
  {
    label: "Reasoning Quality",
    description: "The strength of your logic and structured thinking",
    icon: TrendingUp,
  },
  {
    label: "Confidence Calibration",
    description: "Owning your answers without over-claiming",
    icon: Target,
  },
];

const attemptScores = [
  { label: "Baseline", score: 6.8, delta: null, highlight: false },
  { label: "Attempt 2", score: 7.4, delta: "+0.6 pts", highlight: false },
  { label: "Best Score", score: 8.6, delta: "+1.8 pts", highlight: true },
];

const improvementRows = [
  { metric: "Question Understanding", scores: [6.2, 7.1, 9.1] },
  { metric: "Communication Clarity", scores: [5.8, 7.6, 8.5] },
  { metric: "Reasoning Quality", scores: [7.1, 7.8, 8.7] },
  { metric: "Confidence Calibration", scores: [7.0, 7.2, 8.4] },
  { metric: "Overall Score", scores: [6.8, 7.4, 8.6] },
];

const roles = [
  "Marketing Manager",
  "Registered Nurse",
  "Financial Analyst",
  "Product Manager",
  "Operations Director",
  "Software Engineer",
  "Sales Executive",
  "UX Designer",
  "Project Manager",
  "Management Consultant",
  "Data Analyst",
  "Account Executive",
];

const testimonials = [
  {
    quote:
      "I work in marketing, not tech — and nayld.ai still nailed every question my Deloitte interviewers asked. The mock interview scored my communication clarity and follow-up depth. I knew exactly what to sharpen.",
    name: "Rachel M.",
    role: "Marketing Director",
    company: "Landed at Deloitte",
  },
  {
    quote:
      "Switching careers felt overwhelming. The fit score showed me my gaps honestly, and after two mock interviews I knew how to frame my background. The AI pushed back on every vague answer — and I was ready for it.",
    name: "James L.",
    role: "Corporate Trainer",
    company: "Career Switcher",
  },
  {
    quote:
      "By my third practice session I was scoring 8.6/10. The real interview felt like a formality. Got the offer the same week.",
    name: "Aisha R.",
    role: "Software Engineer",
    company: "Landed at a Series B Startup",
  },
];

const stats = [
  { value: "10,000+", label: "Questions Generated" },
  { value: "95%", label: "Users Felt More Prepared" },
  { value: "2,400+", label: "Candidates Preparing" },
  { value: "8.4/10", label: "Average Satisfaction" },
];

const pricingPlans: Plan[] = [
  {
    name: "Starter",
    price: "$10",
    description: "Try a single mock interview.",
    features: [
      "1 interview credit",
      "Full AI mock interview session",
      "Detailed performance assessment",
      "Credits never expire",
    ],
    cta: "Get Started",
  },
  {
    name: "Standard",
    price: "$25",
    description: "The sweet spot for active job seekers.",
    features: [
      "3 interview credits",
      "Save 17% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 3 Credits",
    highlighted: true,
    popular: true,
  },
  {
    name: "Pro",
    price: "$39",
    description: "Serious prep across multiple roles.",
    features: [
      "5 interview credits",
      "Save 22% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 5 Credits",
  },
  {
    name: "Power",
    price: "$69",
    description: "Maximum prep with best value per credit.",
    features: [
      "10 interview credits",
      "Save 31% vs. buying individually",
      "Full AI mock interview sessions",
      "Credits never expire and stack",
    ],
    cta: "Buy 10 Credits",
  },
];

const faqs = [
  {
    id: "faq-1",
    title: "How does the fit score work?",
    content:
      "Our AI agents analyze both your resume and the job posting to identify alignment across skills, experience, qualifications, and even cultural signals. The result is a 1\u201310 score with detailed breakdowns of strong matches and gaps.",
  },
  {
    id: "faq-2",
    title: "Are the interview questions really tailored to me?",
    content:
      "Yes. Every question is generated from the specific intersection of the job requirements and your resume. If you\u2019re strong in one area, we focus questions on your weaker spots to help you prepare where it matters most.",
  },
  {
    id: "faq-3",
    title: "How realistic are the mock interviews?",
    content:
      "Our AI interviewer adapts in real-time with follow-up probes, just like a real interviewer would. It evaluates not just what you say, but how you structure your answers and handle pressure.",
  },
  {
    id: "faq-4",
    title: "Is my data private?",
    content:
      "Absolutely. Your resume and interview data are encrypted and never shared. You can delete your data anytime. We take privacy as seriously as you take your job search.",
  },
  {
    id: "faq-5",
    title: "What types of roles does nayld.ai support?",
    content:
      "Every role and industry \u2014 from software engineering to nursing, marketing to finance, consulting to operations. If there\u2019s a job posting, nayld.ai can analyze it and run a mock interview for it.",
  },
  {
    id: "faq-6",
    title: "Is it really free to get started?",
    content:
      "Yes. Sign up, upload your resume, add a job, and get your fit score and tailored questions at no cost. No credit card required.",
  },
  {
    id: "faq-7",
    title: "What do I get after a mock interview?",
    content:
      "After each session you receive a performance score across 10 key metrics \u2014 including question understanding, communication clarity, reasoning quality, and confidence calibration. You also get specific strengths, areas to improve, and a full conversation transcript. Most users run 2\u20133 sessions and track their improvement over time.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tableScoreColor(s: number) {
  if (s >= 8) return "text-emerald-600 font-semibold";
  if (s >= 6) return "text-sky-600 font-semibold";
  if (s >= 4) return "text-amber-600 font-semibold";
  return "text-red-500 font-semibold";
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1], delay: 0.2 },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LandingPage({ onPrimaryCta }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ================================================================ */}
      {/* NAVIGATION                                                       */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="/">
            <NayldLogo className="h-9 w-auto" />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="/login">
              <Button
                variant="ghost"
                className="hidden text-sm md:inline-flex"
              >
                Log In
              </Button>
            </a>
            <Button size="sm" onClick={onPrimaryCta} className="hidden sm:inline-flex">
              Get Started Free
            </Button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
            >
              <nav className="flex flex-col gap-1 px-6 py-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <Separator className="my-2" />
                <a
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </a>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onPrimaryCta?.();
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-mm-violet/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute right-1/4 top-20 -z-10 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-mm-blue/[0.06] blur-[100px]" />

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="border-mm-violet/20 bg-mm-violet/[0.06] text-mm-violet">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Join 2,400+ candidates preparing smarter
                </Badge>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                  Your AI interview coach that{" "}
                  <span className="gradient-text">actually pushes back.</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                  Practice with an AI interviewer that adapts to your answers,
                  challenges your weak spots, and scores you on the metrics that
                  actually matter &mdash; so you walk in ready, not hopeful.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  size="lg"
                  onClick={onPrimaryCta}
                  className="glow-accent-light group"
                >
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
              >
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Scored on 10 metrics
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-mm-violet" />
                  Used by 2,400+ candidates
                </span>
              </motion.div>
            </motion.div>

            {/* Right: dual mockup panel */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={scaleIn}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-mm-violet/10 via-mm-blue/5 to-mm-cyan/10 blur-2xl" />
              <div className="relative grid grid-cols-[2fr,3fr] items-start gap-3">
                <InterviewScreenMockup className="opacity-90" />
                <ResultsDashboardMockup compact />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRUST BAR / STATS                                               */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="border-y border-slate-100 bg-slate-50/60 py-10"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* THE GAP                                                          */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div
          variants={fadeInUp}
          className="mx-auto mb-14 max-w-2xl space-y-4 text-center"
        >
          <Badge variant="outline" className="text-xs">
            The Problem
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Knowing the questions isn&rsquo;t enough
          </h2>
          <p className="text-base text-slate-600">
            Most candidates prepare — they just prepare the wrong way.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left: What most people do */}
            <div className="border-b border-slate-200 p-8 lg:border-b-0 lg:border-r">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
                What most people do
              </p>
              <ul className="space-y-4">
                {[
                  "Memorize generic questions from Glassdoor and Reddit",
                  "Practice with friends who can't give real feedback",
                  "Guess which parts of their experience will matter",
                  "Walk in unprepared for the follow-up questions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <span className="text-sm text-slate-500 line-through decoration-slate-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: What nayld does differently */}
            <div className="bg-slate-50/80 p-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-mm-violet">
                What nayld does differently
              </p>
              <ul className="space-y-4">
                {[
                  "Generates questions from your actual resume + this specific job",
                  "An AI interviewer that scores you on real performance metrics",
                  "Shows you exactly where your fit is strong and where to close gaps",
                  "Prepares you for follow-ups with adaptive, probing questions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50 p-8 text-center"
        >
          <p className="mb-6 text-base italic text-slate-600">
            &ldquo;Most candidates feel underprepared — not because they
            didn&rsquo;t try, but because generic prep doesn&rsquo;t work.
            nayld.ai changes that.&rdquo;
          </p>
          <Button onClick={onPrimaryCta} className="glow-accent-light group">
            Start Your First Interview
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </motion.section>

      {/* ================================================================ */}
      {/* INTERVIEW EXPERIENCE                                             */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="The Interview"
              title="An AI interviewer that feels like the real thing"
              subtitle="Adaptive questions, real-time follow-ups, and honest feedback — not a quiz, an actual conversation."
              align="center"
            />
          </motion.div>

          {/* 3 state cards */}
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {(
              [
                {
                  state: "ai" as const,
                  caption: "AI opens with a tailored question",
                  sub: "Based on your resume and this specific job",
                },
                {
                  state: "user" as const,
                  caption: "You answer at your own pace",
                  sub: "Voice-first — no typing, no scripts",
                },
                {
                  state: "followup" as const,
                  caption: "AI digs deeper with a follow-up",
                  sub: "Adapts to exactly what you said",
                },
              ] as const
            ).map(({ state, caption, sub }) => (
              <motion.div key={state} variants={fadeInUp}>
                <InterviewScreenMockup state={state} />
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-slate-700">{caption}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 4 metric cards */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {scoringMetrics.map(({ label, description, icon: Icon }) => (
              <Card
                key={label}
                className="border-slate-200/80 bg-white p-5 transition hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-mm-violet/[0.08]">
                  <Icon className="h-5 w-5 text-mm-violet" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <Link
              href="/ai-mock-interviews"
              className="inline-flex items-center gap-2 text-sm font-medium text-mm-violet transition-colors hover:text-mm-violet/80 group"
            >
              Learn more about AI Mock Interviews
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* RESULTS DASHBOARD                                                */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="Performance"
            title="Your results — scored across 10 real metrics"
            subtitle="Every session ends with a full breakdown of where you stood out and exactly what to improve."
            align="center"
          />
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-14 flex justify-center">
          <div className="w-full max-w-lg">
            <ResultsDashboardMockup />
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-10 grid gap-4 text-center sm:grid-cols-3"
        >
          {[
            {
              icon: "📊",
              label: "10 scored metrics",
              sub: "From reasoning quality to confidence calibration",
            },
            {
              icon: "✦",
              label: "Specific recommendations",
              sub: "Strengths to lean on and weak spots to address",
            },
            {
              icon: "📝",
              label: "Full transcript",
              sub: "Review every question and your exact answers",
            },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200/80 bg-slate-50 px-6 py-5"
            >
              <div className="mb-2 text-2xl">{icon}</div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ================================================================ */}
      {/* IMPROVEMENT JOURNEY                                              */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="Progress"
              title="Track your improvement over time"
              subtitle="Most users improve 1.5+ points by their second attempt. Every session makes you sharper."
              align="center"
            />
          </motion.div>

          {/* Attempt cards */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {attemptScores.map(({ label, score, delta, highlight }) => (
              <motion.div key={label} variants={fadeInUp}>
                <div
                  className={`rounded-2xl border p-6 transition ${
                    highlight
                      ? "border-mm-violet/25 bg-gradient-to-br from-mm-violet/[0.06] to-mm-blue/[0.04] shadow-sm"
                      : "border-slate-200/80 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                      </p>
                      <p
                        className={`mt-1 text-4xl font-bold tracking-tight ${
                          highlight ? "gradient-text" : "text-slate-800"
                        }`}
                      >
                        {score}
                        <span className="text-lg font-normal text-slate-400">/10</span>
                      </p>
                    </div>
                    {delta && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        {delta}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        highlight
                          ? "bg-gradient-to-r from-mm-violet to-mm-blue"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison table */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Metric
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Baseline
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Attempt 2
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-mm-violet">
                    Best
                  </th>
                </tr>
              </thead>
              <tbody>
                {improvementRows.map(({ metric, scores }, idx) => (
                  <tr
                    key={metric}
                    className={`border-b border-slate-50 ${idx === improvementRows.length - 1 ? "border-b-0 bg-slate-50/60 font-semibold" : ""}`}
                  >
                    <td className="px-6 py-3.5 text-left text-slate-700">
                      {metric}
                    </td>
                    {scores.map((s, i) => (
                      <td
                        key={i}
                        className={`px-5 py-3.5 text-center tabular-nums ${tableScoreColor(s)} ${i === 2 ? "text-mm-violet" : ""}`}
                      >
                        {s}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* HOW IT WORKS                                                     */}
      {/* ================================================================ */}
      <motion.section
        id="how-it-works"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="How It Works"
            title="From resume to ready in 3 steps"
            subtitle="No scheduling. No waiting. Upload and start preparing in under 2 minutes."
            align="center"
          />
        </motion.div>

        <div className="mt-14 space-y-4">
          {howItWorksSteps.map((step) => (
            <motion.div key={step.number} variants={fadeInUp}>
              <div
                className={`group flex items-start gap-6 rounded-2xl border p-6 transition-all ${
                  step.highlight
                    ? "border-mm-violet/25 bg-gradient-to-br from-mm-violet/[0.04] to-mm-blue/[0.03] hover:shadow-lg hover:border-mm-violet/40"
                    : "border-slate-200/80 bg-white hover:border-mm-violet/20 hover:shadow-lg"
                }`}
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm ${
                    step.highlight
                      ? "bg-gradient-to-br from-mm-violet to-mm-blue"
                      : "bg-gradient-to-br from-slate-600 to-slate-700"
                  }`}
                >
                  {step.number}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <step.icon
                      className={`h-5 w-5 ${step.highlight ? "text-mm-violet" : "text-slate-400"}`}
                    />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        step.highlight
                          ? "bg-mm-violet/10 text-mm-violet"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* ROLE DIVERSITY                                                   */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="All Roles"
              title="Built for every role, not just tech"
              subtitle="Upload any job posting and nayld.ai will tailor your fit score, questions, and mock interview to that specific role."
              align="center"
            />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-mm-violet/30 hover:text-mm-violet"
              >
                {role}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-10 text-center">
            <Button onClick={onPrimaryCta} className="glow-accent-light group">
              Start Practicing Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* SOCIAL PROOF / TESTIMONIALS                                      */}
      {/* ================================================================ */}
      <motion.section
        id="results"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="Results"
            title="Candidates don&rsquo;t just feel prepared — they are prepared"
            align="center"
          />
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* FEATURED IN                                                      */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp} className="text-center">
            <p className="mb-8 text-sm font-medium uppercase tracking-wider text-slate-500">
              As Featured On
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <a
                href="https://theresanaiforthat.com/ai/nayld-ai/?ref=featured&v=9353283"
                target="_blank"
                rel="nofollow"
              >
                <img
                  width="300"
                  src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"
                />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* PRICING                                                          */}
      {/* ================================================================ */}
      <motion.section
        id="pricing"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="Pricing"
              title="Buy credit packs — no subscriptions"
              subtitle="Prep tools are free. Buy interview credits only when you need them. Credits never expire."
              align="center"
            />
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <PricingCard plan={plan} onCta={onPrimaryCta} />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-8">
            <Card className="border-mm-violet/20 bg-gradient-to-br from-mm-violet/[0.05] via-white to-mm-blue/[0.04] p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl space-y-3">
                  <Badge className="w-fit border-mm-violet/20 bg-white text-mm-violet">
                    Free Forever
                  </Badge>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Prep tools at no cost
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    See your fit score and get tailored questions for free. When
                    you&rsquo;re ready to practice for real, each mock interview
                    is one credit &mdash; and every credit comes with a full
                    performance assessment, detailed recommendations, and a
                    complete transcript.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {[
                      "Upload resumes and job postings for free",
                      "Get a 1\u201310 fit score with gap analysis",
                      "Receive tailored interview questions",
                      "Each mock interview consumes exactly one credit",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type="button"
                  onClick={onPrimaryCta}
                  className="shrink-0"
                >
                  Get Started Free
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-mm-violet transition-colors hover:text-mm-violet/80 group"
            >
              View full pricing details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* FAQ                                                              */}
      {/* ================================================================ */}
      <motion.section
        id="faq"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20"
      >
        <div className="mx-auto max-w-3xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="FAQ"
              title="Want to know more?"
              subtitle="Still deciding? Here are the common questions."
              align="center"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-10">
            <Accordion items={faqs} />
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mm-violet via-mm-blue to-mm-cyan p-12 text-center shadow-2xl sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Stop preparing in your head. Start practicing out loud.
            </h2>
            <p className="text-base text-white/80">
              Upload your resume, add the job, and run your first mock
              interview. Free fit score included &mdash; interview credits start
              at $10.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={onPrimaryCta}
                className="w-full bg-white text-mm-violet shadow-lg hover:bg-white/90 sm:w-auto"
              >
                Start Practicing Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-white/60">
              No credit card required. Set up in under 60 seconds.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* FOOTER                                                           */}
      {/* ================================================================ */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <a href="/">
                <NayldLogo className="mb-4 h-7 w-auto" />
              </a>
              <p className="text-sm text-slate-600">
                AI-powered interview preparation platform that scores
                resume-job fit, generates tailored questions, and conducts
                realistic mock interviews.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Product
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/resume-fit-score"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Resume Fit Score
                  </a>
                </li>
                <li>
                  <a
                    href="/ai-mock-interviews"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    AI Mock Interviews
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Resources
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/blog"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/compare"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Compare Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Company
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:hello@nayld.ai"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="/refund"
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a
                href="/login"
                className="transition-colors hover:text-slate-900"
              >
                Log In
              </a>
              <a
                href="/signup"
                className="transition-colors hover:text-slate-900"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
