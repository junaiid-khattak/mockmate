"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Menu,
  Mic,
  Search,
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
      "Instant analysis — see exactly how well you match the role and get questions generated from your specific resume and this job. Now you know the diagnosis. The next step is the treatment.",
    icon: BarChart3,
    badge: "Free",
    highlight: false,
  },
  {
    number: "03",
    title: "Close the gaps with a live AI mock interview",
    description:
      "Your AI interviewer targets your weak spots in real-time, challenges you with follow-ups, and scores you across 10 metrics — so you walk in knowing exactly where you stand. The diagnosis without the practice is just anxiety.",
    icon: Mic,
    badge: "From $5",
    highlight: true,
  },
];

// 4 metrics shown in the Interview Experience section cards
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

// All 10 metrics grouped for the 10 Metrics section
const allMetrics = [
  {
    group: "Knowledge & Accuracy",
    items: [
      {
        label: "Answer Correctness",
        desc: "Are your answers technically accurate and complete?",
        why: "Correct answers are the strongest predictor of interview pass outcomes.",
        Icon: CheckCircle2,
      },
      {
        label: "Reasoning Quality",
        desc: "Is your thinking process logical and well-structured?",
        why: "Interviewers evaluate your thinking process, not only final conclusions.",
        Icon: Brain,
      },
      {
        label: "Question Understanding",
        desc: "Do you fully understand what's being asked before answering?",
        why: "Good clarification prevents solving the wrong problem and improves answer precision.",
        Icon: Search,
      },
    ],
  },
  {
    group: "Communication & Delivery",
    items: [
      {
        label: "Communication Clarity",
        desc: "Are you concise, structured, and easy to follow?",
        why: "Clear structure helps interviewers quickly trust and score your thinking.",
        Icon: Mic,
      },
      {
        label: "Behavioral Story Quality",
        desc: "Do your stories have ownership, actions, and measurable impact?",
        why: "Behavioral loops are scored on ownership, actions, and measurable impact.",
        Icon: Users,
      },
      {
        label: "Confidence Calibration",
        desc: "Do you project balanced confidence without over- or underclaiming?",
        why: "Balanced confidence signals judgment; overconfidence reduces trust.",
        Icon: Shield,
      },
    ],
  },
  {
    group: "Interview Strategy",
    items: [
      {
        label: "Role Alignment Coverage",
        desc: "Are you mapping your experience to what this role needs?",
        why: "You need to demonstrate the exact skills this role values, not generic competence.",
        Icon: Target,
      },
      {
        label: "Depth Under Follow-ups",
        desc: "Can you maintain quality when the interviewer pushes deeper?",
        why: "Strong candidates maintain quality when the interviewer increases pressure.",
        Icon: TrendingUp,
      },
      {
        label: "Time Management",
        desc: "Are you delivering enough signal within the time limit?",
        why: "Interview success depends on delivering enough signal within time limits.",
        Icon: Clock,
      },
      {
        label: "Recovery Ability",
        desc: "How do you handle questions outside your comfort zone?",
        why: "How you recover from misses often matters more than the initial miss itself.",
        Icon: Zap,
      },
    ],
  },
];

// Full results dashboard data (all 10 metrics in 3 groups)
const metricGroupsData = [
  {
    label: "Knowledge & Accuracy",
    metrics: [
      { label: "Answer Correctness", score: 95 },
      { label: "Reasoning Quality", score: 85 },
      { label: "Question Understanding", score: 60 },
    ],
  },
  {
    label: "Communication & Delivery",
    metrics: [
      { label: "Communication Clarity", score: 75 },
      { label: "Behavioral Story Quality", score: 60 },
      { label: "Confidence Calibration", score: 80 },
    ],
  },
  {
    label: "Interview Strategy",
    metrics: [
      { label: "Recovery Ability", score: 95 },
      { label: "Time Management", score: 75 },
      { label: "Depth Under Follow-ups", score: 70 },
      { label: "Role Alignment Coverage", score: 50 },
    ],
  },
];

const dashboardStrengths = [
  "Strong technical knowledge through detailed explanations of event-driven architecture",
  "Clear reasoning when discussing system design and scaling strategies",
  "Smooth recovery when handling questions outside direct experience",
];

const dashboardGrowthAreas = [
  "Improve question understanding — paraphrase before answering",
  "Enhance behavioral storytelling with STAR-formatted narratives",
  "Explicitly link experience to job description terms and requirements",
];

// Improvement Journey
const attemptScores = [
  { label: "Attempt 1", score: 6.2, delta: null, highlight: false },
  { label: "Attempt 2", score: 7.1, delta: "+0.9", highlight: false },
  { label: "Attempt 3", score: 8.2, delta: "+2.0", highlight: true },
];

const improvementRows = [
  { metric: "Answer Correctness", scores: [85, 90, 95], scale100: true },
  { metric: "Reasoning Quality", scores: [70, 78, 85], scale100: true },
  { metric: "Communication Clarity", scores: [60, 68, 75], scale100: true },
  { metric: "Behavioral Story Quality", scores: [40, 52, 60], scale100: true },
  { metric: "Role Alignment", scores: [35, 42, 50], scale100: true },
  { metric: "Overall", scores: [6.2, 7.1, 8.2], scale100: false },
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

const stats = [
  { value: "10", label: "Performance Metrics", sub: "Scored every session" },
  { value: "Every Industry", label: "Tech to healthcare" },
  { value: "From $5", label: "Per Interview", sub: "Credits never expire" },
  { value: "Free", label: "Fit Score & Questions", sub: "No credit card required" },
];

const pricingPlans: Plan[] = [
  {
    name: "Starter",
    price: "$10",
    description: "Try a single mock interview.",
    features: [
      "1 interview credit",
      "Full AI mock interview session",
      "Shareable performance assessment with 10 scored metrics",
      "Credits never expire",
    ],
    cta: "Get Started",
    note: "First interview? Get 50% off — try it for $5 with our intro offer.",
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
      "Every role and industry \u2014 from software engineering to nursing, marketing to finance, consulting to operations. Our AI adapts to any job description.",
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
      "A detailed assessment across 10 metrics: Answer Correctness, Reasoning Quality, Communication Clarity, Behavioral Story Quality, Role Alignment Coverage, and 5 more. Each metric includes evidence from your answers, a next action, and an explanation of why it matters. Plus overall strengths, growth areas, next steps, and a full transcript.",
  },
  {
    id: "faq-8",
    title: "Can I share my results?",
    content:
      "Yes. Every completed mock interview generates a shareable public link you can send to anyone — mentors, coaches, or recruiters on LinkedIn. The link shows your full performance assessment: all 10 scored metrics, your strengths, and your growth areas. You control when to share and with whom.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// For individual metrics (0–100 scale)
function tableScoreColor100(s: number) {
  if (s >= 80) return "text-emerald-600 font-semibold";
  if (s >= 60) return "text-amber-600 font-semibold";
  return "text-red-500 font-semibold";
}

// For Overall score (/10 scale)
function tableScoreColor10(s: number) {
  if (s >= 8) return "text-emerald-600 font-semibold";
  if (s >= 6) return "text-sky-600 font-semibold";
  return "text-amber-600 font-semibold";
}

// For dark-background inline mockup (0–100)
function darkScoreColor(s: number) {
  if (s >= 80) return "#34d399";
  if (s >= 60) return "#fbbf24";
  return "#f87171";
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
              <Button variant="ghost" className="hidden text-sm md:inline-flex">
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
              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                  Your AI interview coach that{" "}
                  <span className="gradient-text">actually pushes back.</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                  Practice with an AI interviewer that adapts in real-time,
                  challenges your weak spots, and scores you across 10
                  performance metrics &mdash; so you walk in knowing exactly
                  where you stand.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" onClick={onPrimaryCta} className="glow-accent-light group">
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    See How It Works
                  </Button>
                </a>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
              >
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Zap className="h-4 w-4 text-amber-500" />
                  10 performance metrics
                </span>
              </motion.div>
            </motion.div>

            {/* Right: stacked mockup panels */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={scaleIn}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-mm-violet/10 via-mm-blue/5 to-mm-cyan/10 blur-3xl" />
              <div className="relative space-y-3">
                <div className="overflow-hidden rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.06]">
                  <InterviewScreenMockup />
                </div>
                <div className="overflow-hidden rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.06]">
                  <ResultsDashboardMockup />
                </div>
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
                {"sub" in stat && stat.sub && (
                  <div className="mt-0.5 text-xs text-slate-400">{stat.sub}</div>
                )}
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
                  "Read questions from a list, then rehearse alone in silence",
                  "Practice with friends who can't give honest feedback",
                  "Feel ready — then freeze when the interviewer pushes deeper",
                  "Get rejected without knowing what cost them the offer",
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
              <ul className="space-y-5">
                {[
                  {
                    text: "AI asks follow-ups and challenges your answers",
                    metric: "Depth Under Follow-ups",
                  },
                  {
                    text: "Practice speaking out loud — not just reading",
                    metric: "Communication Clarity",
                  },
                  {
                    text: "Learn if you're actually answering the right question",
                    metric: "Question Understanding",
                  },
                  {
                    text: "See if you're mapping your experience to the role",
                    metric: "Role Alignment Coverage",
                  },
                  {
                    text: "Know if your confidence is calibrated or overblown",
                    metric: "Confidence Calibration",
                  },
                ].map(({ text, metric }) => (
                  <li key={metric} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{text}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-mm-violet/[0.08] px-2.5 py-0.5 text-xs font-semibold text-mm-violet">
                        {metric}
                      </span>
                    </div>
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
          <p className="mb-6 text-base text-slate-600">
            The fit score and questions are free.{" "}
            <span className="font-semibold text-slate-800">
              The real transformation happens when you practice out loud
            </span>{" "}
            — and see where your 10 metrics fall.
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
                <div className="overflow-hidden rounded-[20px] shadow-[0_20px_56px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.06]">
                  <InterviewScreenMockup state={state} />
                </div>
                <div className="mt-4 text-center">
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
      {/* THE 10 METRICS                                                   */}
      {/* ================================================================ */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.08 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="10 Metrics"
            title="Scored across 10 metrics that real interviewers care about"
            subtitle="Every mock interview gives you a diagnostic breakdown that shows exactly where you're strong — and what's costing you offers."
            align="center"
          />
        </motion.div>

        {/* 3-column grouped grid */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {allMetrics.map(({ group, items }) => (
            <motion.div key={group} variants={fadeInUp}>
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-700">{group}</h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-3">
                {items.map(({ label, desc, why, Icon }) => (
                  <Card
                    key={label}
                    className="border-slate-200/80 bg-white p-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mm-violet/[0.07]">
                        <Icon className="h-4 w-4 text-mm-violet" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                        <p className="mt-2 text-xs italic leading-relaxed text-slate-400">
                          &ldquo;{why}&rdquo;
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded metric card mockup — Recovery Ability */}
        <motion.div variants={fadeInUp} className="mt-10">
          <p className="mb-4 text-center text-sm font-medium text-slate-500">
            Example metric card from your results:
          </p>
          <div className="mx-auto max-w-xl">
            <div
              style={{
                background: "#0e1424",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 24,
                fontFamily: "'Instrument Sans', -apple-system, sans-serif",
                WebkitFontSmoothing: "antialiased",
                boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>
                  Recovery Ability
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#34d399",
                    }}
                  >
                    95
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    /100
                  </span>
                </div>
              </div>
              {/* Bar */}
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "95%",
                    background: "#34d399",
                    borderRadius: 2,
                  }}
                />
              </div>
              {/* Evidence */}
              <div style={{ marginBottom: 14 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#34d399",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  📝 Evidence
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.55,
                  }}
                >
                  &ldquo;Candidate smoothly redirected when lacking direct experience and provided alternative relevant examples.&rdquo;
                </p>
              </div>
              {/* Next Action */}
              <div style={{ marginBottom: 14 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#22d3ee",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  🎯 Next Action
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.55,
                  }}
                >
                  &ldquo;Continue developing strategies to recover gracefully from challenging or unfamiliar questions.&rdquo;
                </p>
              </div>
              {/* Why It Matters */}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  💡 Why This Matters
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.55,
                  }}
                >
                  &ldquo;How you recover from misses often matters more than the initial miss itself.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-10 text-center">
          <Button onClick={onPrimaryCta} className="glow-accent-light group">
            See your 10 metrics — Start a mock interview
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </motion.section>

      {/* ================================================================ */}
      {/* RESULTS DASHBOARD                                                */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.08 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="Performance"
              title="A complete post-interview breakdown — not just a score"
              subtitle="After every interview: 10 scored metrics with evidence, specific strengths and growth areas, actionable next steps, and a full transcript."
              align="center"
            />
          </motion.div>

          {/* Full 10-metric dark mockup */}
          <motion.div variants={fadeInUp} className="mt-14">
            <div
              style={{
                background: "#0e1424",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 32,
                fontFamily: "'Instrument Sans', -apple-system, sans-serif",
                WebkitFontSmoothing: "antialiased",
                boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 24,
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#34d399",
                    boxShadow: "0 0 6px #34d399",
                  }}
                />
                Interview Complete
              </div>

              {/* Score + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
                <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
                  <svg
                    style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
                    viewBox="0 0 160 160"
                  >
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                      cx="80" cy="80" r="70" fill="none" stroke="#34d399" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="440"
                      strokeDashoffset={Math.round(440 * (1 - 8.2 / 10))}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute", inset: 0, display: "flex",
                      flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#34d399", lineHeight: 1, letterSpacing: "-1px" }}>
                      8.2
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>/10</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 6 }}>Strong Performance</div>
                  <div
                    style={{
                      display: "inline-flex", alignItems: "center",
                      background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                      borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#34d399",
                    }}
                  >
                    Top 28% of candidates
                  </div>
                </div>
              </div>

              {/* 3 metric groups */}
              <div className="grid gap-6 md:grid-cols-3" style={{ marginBottom: 28 }}>
                {metricGroupsData.map(({ label, metrics }) => (
                  <div key={label}>
                    <p
                      style={{
                        fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.8px", color: "rgba(255,255,255,0.25)", marginBottom: 10,
                      }}
                    >
                      {label}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {metrics.map(({ label: mLabel, score }) => {
                        const c = darkScoreColor(score);
                        return (
                          <div key={mLabel} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {mLabel}
                            </div>
                            <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden", flexShrink: 0 }}>
                              <div style={{ height: "100%", width: `${score}%`, background: c, borderRadius: 2 }} />
                            </div>
                            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: c, width: 24, textAlign: "right", flexShrink: 0 }}>
                              {score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }} />

              {/* Strengths + Growth Areas */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#34d399", marginBottom: 10 }}>
                    ✦ Strengths
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dashboardStrengths.map((s) => (
                      <div
                        key={s}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 8,
                          background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.12)",
                          borderRadius: 8, padding: "8px 10px",
                        }}
                      >
                        <span style={{ color: "#34d399", fontSize: 11, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#fbbf24", marginBottom: 10 }}>
                    ⚡ Growth Areas
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dashboardGrowthAreas.map((g) => (
                      <div
                        key={g}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 8,
                          background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)",
                          borderRadius: 8, padding: "8px 10px",
                        }}
                      >
                        <span style={{ color: "#fbbf24", fontSize: 11, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <p className="mb-6 text-base text-slate-600">
              This is the feedback a{" "}
              <span className="font-semibold text-slate-800">$200/hr career coach</span> would
              give — and you&rsquo;re getting it for $10. Share your verified assessment with
              mentors, coaches, or your LinkedIn network &mdash; show them exactly where you stand.
            </p>
            <Button onClick={onPrimaryCta} className="glow-accent-light group">
              Start Your First Mock Interview
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* IMPROVEMENT JOURNEY                                              */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="Progress"
            title="Watch yourself get better with every attempt"
            subtitle="Each interview adapts based on where you scored lowest. Every weak spot becomes a growth area with a clear next action."
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
                      +{delta} pts
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
                  Attempt 1
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attempt 2
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-mm-violet">
                  Attempt 3
                </th>
              </tr>
            </thead>
            <tbody>
              {improvementRows.map(({ metric, scores, scale100 }, idx) => (
                <tr
                  key={metric}
                  className={`border-b border-slate-50 ${
                    idx === improvementRows.length - 1
                      ? "border-b-0 bg-slate-50/60 font-semibold"
                      : ""
                  }`}
                >
                  <td className="px-6 py-3.5 text-left text-slate-700">{metric}</td>
                  {scores.map((s, i) => (
                    <td
                      key={i}
                      className={`px-5 py-3.5 text-center tabular-nums ${
                        scale100 ? tableScoreColor100(s) : tableScoreColor10(s)
                      } ${i === 2 ? "!text-mm-violet" : ""}`}
                    >
                      {s}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-8 text-center">
          <p className="mb-5 text-sm text-slate-500">
            Share your progress with mentors and recruiters who want to see how far you&rsquo;ve come.
          </p>
          <Button onClick={onPrimaryCta} className="glow-accent-light group">
            Start Improving
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
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
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
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
                      ? "border-mm-violet/25 bg-gradient-to-br from-mm-violet/[0.04] to-mm-blue/[0.03] hover:border-mm-violet/40 hover:shadow-lg"
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
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
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
                    <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="All Roles"
            title="Built for every role, not just tech"
            subtitle="Whether you're interviewing for a hospital, a bank, a startup, or a Fortune 500 — our AI adapts to any role, any industry, any seniority level."
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
      </motion.section>

      {/* ================================================================ */}
      {/* LISTED ON                                                        */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-white py-20 border-y border-slate-100"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp} className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7c5cfc]">
              Recognition
            </p>
            <h2 className="mb-3 text-2xl font-bold text-[#111118]">
              Featured On
            </h2>
            <p className="mb-12 text-sm text-slate-500">
              Recognized by leading AI and SaaS directories
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12">
              <a
                href="https://theresanaiforthat.com/ai/nayld-ai/?ref=featured&v=9353283"
                target="_blank"
                rel="nofollow"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width="280"
                  src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"
                  alt="Featured on There's An AI For That"
                />
              </a>
              <a
                href="https://www.saashub.com/nayldai?utm_source=badge&utm_campaign=badge&utm_content=nayldai&badge_variant=color&badge_kind=approved"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"
                  alt="nayld.ai featured on SaaSHub"
                  style={{ width: 160 }}
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
                    is one credit &mdash; and every credit comes with{" "}
                    <span className="font-semibold text-slate-800">
                      10 scored metrics, specific evidence and next actions,
                      strengths and growth areas, and a full transcript.
                    </span>
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
                <Button type="button" onClick={onPrimaryCta} className="shrink-0">
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
              Upload your resume, add the job, and get scored across 10 metrics
              in your first mock interview. Free fit score included &mdash;
              interview credits start at $10.
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
            <div className="md:col-span-1">
              <a href="/">
                <NayldLogo className="mb-4 h-7 w-auto" />
              </a>
              <p className="text-sm text-slate-600">
                AI-powered interview preparation platform that scores
                resume-job fit, generates tailored questions, and conducts
                realistic mock interviews scored across 10 performance metrics.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Product</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Resume Fit Score", href: "/resume-fit-score" },
                  { label: "AI Mock Interviews", href: "/ai-mock-interviews" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "How It Works", href: "#how-it-works" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-slate-600 transition-colors hover:text-slate-900">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Resources</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "Compare Tools", href: "/compare" },
                  { label: "FAQ", href: "#faq" },
                  { label: "Become an Affiliate", href: "https://affiliate.nayld.ai/apply" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-slate-600 transition-colors hover:text-slate-900">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Company</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Contact", href: "mailto:hello@nayld.ai" },
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                  { label: "Refund Policy", href: "/refund" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-slate-600 transition-colors hover:text-slate-900">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="/login" className="transition-colors hover:text-slate-900">Log In</a>
              <a href="/signup" className="transition-colors hover:text-slate-900">Sign Up</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
