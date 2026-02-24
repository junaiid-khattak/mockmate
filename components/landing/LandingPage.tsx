"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  Menu,
  Mic,
  Play,
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
import { FeatureCard } from "@/components/landing/feature-card";
import { FitScorePreview } from "@/components/landing/fit-score-preview";
import { PricingCard, type Plan } from "@/components/landing/pricing-card";
import { TestimonialCard } from "@/components/landing/testimonial-card";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type LandingPageProps = { onPrimaryCta?: () => void };

type NavItem = { label: string; href: string };
const navItems: NavItem[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Results", href: "#results" },
  { label: "FAQ", href: "#faq" },
];

const painPoints = [
  {
    emoji: "\uD83C\uDFAF",
    before: "Guessing which questions they'll ask",
    after: "Exact questions tailored to this job + your resume",
  },
  {
    emoji: "\uD83D\uDCC4",
    before: "Wondering if your resume even fits the role",
    after: "A clear fit score with gap analysis in seconds",
  },
  {
    emoji: "\uD83E\uDD37",
    before: "Generic interview prep that covers everything and nothing",
    after: "Focused prep on your actual weak spots",
  },
  {
    emoji: "\uD83D\uDE36",
    before: "No real feedback until the rejection email",
    after: "Honest AI assessment with specific recommendations",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload Your Resume",
    description:
      "Drop your PDF resume. Our AI parses your skills, experience, and qualifications instantly.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Add the Job Posting",
    description:
      "Paste the job URL or description. We analyze every requirement, skill, and qualification listed.",
    icon: Briefcase,
  },
  {
    number: "03",
    title: "Get Your Fit Score & Questions",
    description:
      "Receive a 1\u201310 fit score, gap analysis, and interview questions tailored to where you\u2019re strong and where you need to prepare.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "Practice with Mock Interviews",
    description:
      "Run realistic AI-powered mock interviews with follow-up probes, just like the real thing.",
    icon: Mic,
  },
  {
    number: "05",
    title: "Get Your Assessment",
    description:
      "Receive a detailed breakdown of weak spots, strengths, and actionable recommendations to nail the real interview.",
    icon: TrendingUp,
  },
];

const features = [
  {
    title: "AI Job Analysis",
    description:
      "Our agents dissect every job posting to understand exactly what the hiring team is looking for \u2014 requirements, culture signals, and hidden priorities.",
    icon: Search,
    badge: "AI-Powered",
  },
  {
    title: "Resume-Job Fit Score",
    description:
      "Get an honest 1\u201310 score showing how well your resume matches the role, plus a breakdown of strong alignment areas and gaps to close.",
    icon: Target,
  },
  {
    title: "Tailored Question Generation",
    description:
      "No generic lists. Every question is generated from the intersection of the job requirements and your specific background.",
    icon: Brain,
  },
  {
    title: "AI Mock Interviews",
    description:
      "Practice with an AI interviewer that adapts in real-time, asks follow-ups, and simulates real interview pressure.",
    icon: Mic,
  },
  {
    title: "Weakness Assessment",
    description:
      "Know exactly where you\u2019re falling short before the real interview. Get specific, actionable recommendations to turn weaknesses into strengths.",
    icon: Zap,
  },
];

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
      "As a career switcher, I had no idea what to expect. The weakness assessment and recommendations gave me a clear roadmap. I went from a 4/10 fit score to getting the job.",
    name: "Priya D.",
    role: "Data Scientist",
    company: "Landed at Netflix",
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
      "We support engineering, product, design, data science, operations, and more. Our AI agents are trained across industries and seniority levels, from new grad to executive.",
  },
  {
    id: "faq-6",
    title: "Is it really free to get started?",
    content:
      "Yes. Sign up, upload your resume, add a job, and get your fit score and tailored questions at no cost. No credit card required.",
  },
];

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

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
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
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="border-mm-violet/20 bg-mm-violet/[0.06] text-mm-violet">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Join 2,000+ candidates preparing smarter
                </Badge>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                  Stop guessing.{" "}
                  <span className="gradient-text">
                    Nail your next interview.
                  </span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                  nayld.ai analyzes the job, scores your resume fit, generates
                  tailored interview questions, and coaches you through mock
                  interviews &mdash; so you walk in prepared, not anxious.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Button
                  size="lg"
                  onClick={onPrimaryCta}
                  className="glow-accent-light group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </a>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-3"
              >
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Results in under 2 minutes
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={scaleIn}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-mm-violet/10 via-mm-blue/5 to-mm-cyan/10 blur-2xl" />
              <FitScorePreview className="relative" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PROBLEM / PAIN POINTS                                            */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
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
            Interview prep is broken
          </h2>
          <p className="text-base text-slate-600">
            Most candidates waste hours on generic prep and walk into interviews
            hoping for the best. You deserve better.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {painPoints.map((point, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <Card className="h-full border-slate-200/80 bg-white p-6 transition hover:shadow-md">
                <div className="mb-4 text-2xl">{point.emoji}</div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <p className="text-sm text-slate-500 line-through decoration-slate-300">
                      {point.before}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-800">
                      {point.after}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
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
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeInUp}>
            <SectionTitle
              eyebrow="How It Works"
              title="From resume to ready in 5 steps"
              subtitle="No scheduling. No waiting. Upload and start preparing in under 2 minutes."
              align="center"
            />
          </motion.div>

          <div className="mt-14 space-y-4">
            {steps.map((step) => (
              <motion.div key={step.number} variants={fadeInUp}>
                <div className="group flex items-start gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:border-mm-violet/20 hover:shadow-lg">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mm-violet to-mm-blue text-lg font-bold text-white shadow-sm">
                    {step.number}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-5 w-5 text-mm-violet" />
                      <h3 className="text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* FEATURES                                                         */}
      {/* ================================================================ */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <motion.div variants={fadeInUp}>
          <SectionTitle
            eyebrow="Features"
            title="Everything you need to prepare with confidence"
            subtitle="AI agents specifically trained for interview preparation, working together to give you an unfair advantage."
            align="center"
          />
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {features.slice(3).map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* PRODUCT PREVIEW                                                  */}
      {/* ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-slate-50/80 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div variants={slideInLeft} className="space-y-6">
              <Badge variant="outline" className="text-xs">
                Product Preview
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                See exactly where you stand{" "}
                <span className="gradient-text">before you walk in</span>
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                Every job you add gets an instant fit analysis. See your score,
                understand your strengths, identify gaps, and know exactly which
                questions to expect &mdash; all before the interview starts.
              </p>
              <ul className="space-y-3">
                {[
                  "Instant 1\u201310 fit score with detailed breakdown",
                  "Clear view of strong alignment and weak spots",
                  "Predicted interview focus areas",
                  "Tailored questions generated from the analysis",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={onPrimaryCta} className="glow-accent-light">
                Try It With Your Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div variants={slideInRight}>
              <FitScorePreview />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* SOCIAL PROOF / RESULTS                                           */}
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
            title="Candidates don't just feel prepared — they are prepared"
            align="center"
          />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
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
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
              As Featured On
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <a href="https://theresanaiforthat.com/ai/nayld-ai/?ref=featured&v=9353283" target="_blank" rel="nofollow"><img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"></img></a>
              {/* Add more featured badges here as needed */}
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

          <div className="mt-14 grid gap-5 grid-cols-2 lg:grid-cols-4">
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
                    Resume analysis, fit scoring, gap analysis, and tailored question generation are completely free. You only pay when you want a live mock interview.
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
        className="bg-slate-50/80 py-20"
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
              Ready to nail your next interview?
            </h2>
            <p className="text-base text-white/80">
              Stop guessing what they&rsquo;ll ask. Upload your resume, add the
              job, and get a personalized game plan in under 2 minutes. Free to
              start.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={onPrimaryCta}
                className="w-full bg-white text-mm-violet shadow-lg hover:bg-white/90 sm:w-auto"
              >
                Get Started Free
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
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <a href="/">
            <NayldLogo className="h-7 w-auto" />
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <a
              href="#features"
              className="transition-colors hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-slate-900"
            >
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-slate-900">
              FAQ
            </a>
            <a
              href="mailto:hello@nayld.ai"
              className="transition-colors hover:text-slate-900"
            >
              Contact
            </a>
            <a href="/login" className="transition-colors hover:text-slate-900">
              Log In
            </a>
            <a href="/privacy" className="transition-colors hover:text-slate-900">
              Privacy
            </a>
            <a href="/terms" className="transition-colors hover:text-slate-900">
              Terms
            </a>
            <a href="/refund" className="transition-colors hover:text-slate-900">
              Refund Policy
            </a>
          </nav>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} nayld.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
