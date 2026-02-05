'use client';

import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  GaugeCircle,
  Lightbulb,
  MessagesSquare,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/landing/section-title";
import { FeatureCard } from "@/components/landing/feature-card";
import { PricingCard } from "@/components/landing/pricing-card";
import { SampleReportCard } from "@/components/landing/sample-report-card";

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
  { label: "How it works", href: "#how" },
  { label: "What you get", href: "#features" },
  { label: "Personas", href: "#personas" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const steps = [
  {
    title: "Upload your resume",
    description: "Drop a PDF or link. We parse your experience and role level automatically.",
    icon: FileUp,
  },
  {
    title: "Get interviewed",
    description: "Voice or text interview with role-tuned question sets and follow-up probes.",
    icon: Mic,
  },
  {
    title: "Receive a scorecard",
    description: "AI+human style scoring with actionable deltas and shareable report.",
    icon: GaugeCircle,
  },
];

const features = [
  {
    title: "Role-calibrated questions",
    description: "Interview flows match seniority, domain, and company profile for higher realism.",
    icon: MessagesSquare,
  },
  {
    title: "Instant, specific feedback",
    description: "Score by dimension plus suggested rewrites, frameworks, and story prompts.",
    icon: Sparkles,
  },
  {
    title: "Coaching-ready exports",
    description: "Send annotated transcripts and clip highlights to your mentor in one click.",
    icon: Lightbulb,
  },
];

const personas = [
  {
    id: "pro-evaluator",
    title: "Professional Evaluator",
    description: "Ex-FAANG interviewer voice with calibrated scoring rubrics and benchmark data.",
    tag: "Live",
  },
  {
    id: "eng-manager",
    title: "Engineering Manager",
    description: "Managerial behavioral loops for ownership, leadership, and velocity. Coming soon.",
    tag: "Coming soon",
  },
  {
    id: "pm-panel",
    title: "Product Panel",
    description: "Multi-interviewer dynamic probing prioritization, metrics, and tradeoffs.",
    tag: "Coming soon",
  },
  {
    id: "ops-coach",
    title: "Career Coach",
    description: "Warm but direct coaching style with weekly improvement plan and drills.",
    tag: "Coming soon",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Quick taste of the MockMate flow.",
    features: ["1 mock interview", "Basic scorecard", "Email delivery"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29/month",
    description: "For active jobseekers needing reps every week.",
    features: [
      "Weekly mock interviews",
      "Advanced scorecards with transcripts",
      "Custom role calibration",
      "Save highlights & notes",
    ],
    cta: "Choose Pro",
    highlighted: true,
    popular: true,
  },
  {
    name: "Interview Week Pass",
    price: "$19",
    description: "Prep sprint for onsite week. Expires in 7 days.",
    features: ["3 rapid-fire mocks", "Day-by-day drill plan", "Downloadable reports"],
    cta: "Grab the pass",
  },
];

const faqs = [
  {
    id: "faq-1",
    title: "Can I use my own questions or a job description?",
    content: "Yes. Paste a JD or add custom prompts. We align questions and scoring to it instantly.",
  },
  {
    id: "faq-2",
    title: "How realistic are the interviews?",
    content:
      "We blend interviewer personas trained on real rubrics plus adaptive follow-ups so it feels like a live loop, not a quiz.",
  },
  {
    id: "faq-3",
    title: "Do you store my resume?",
    content: "Your uploads stay private. You can delete data anytime; exports are yours to keep.",
  },
  {
    id: "faq-4",
    title: "Is there a human in the loop?",
    content: "Pro plans include optional reviewer spot checks and coaching-quality annotations.",
  },
  {
    id: "faq-5",
    title: "Does it support non-technical roles?",
    content:
      "Yes. We currently support product, design, operations, and data. More roles roll out monthly.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/20 via-purple-400/15 to-blue-400/20 blur-3xl" />
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span>MockMate</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition hover:text-slate-900 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden text-sm md:inline-flex">
              View sample report
            </Button>
            <Button size="sm">Try free mock interview</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-12 sm:py-16">
        <section className="relative grid items-center gap-10 rounded-3xl bg-white/80 px-6 py-12 shadow-lg backdrop-blur-lg dark:bg-slate-900/70 sm:grid-cols-2 sm:px-10">
          <motion.div initial="hidden" animate="show" variants={fadeIn} className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Trusted by candidates from Stripe, Figma, Netflix
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Upload your resume. Get interviewed. Get a scorecard. Improve fast.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                MockMate runs realistic, role-calibrated mock interviews and delivers a coaching-ready
                report in minutes — so your next real loop feels easy.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button className="w-full sm:w-auto">Try free mock interview</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                View sample report
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Badge variant="outline" className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900">
                10-minute setup
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900">
                Human-quality feedback
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900">
                Private by default
              </Badge>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-purple-500/15 blur-2xl" />
            <SampleReportCard className="relative" />
          </motion.div>
        </section>

        <motion.section id="how" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeIn} className="space-y-10">
          <SectionTitle
            eyebrow="How it works"
            title="Three steps to a tailored mock interview"
            subtitle="No scheduling. No waiting. Just upload and start."
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, idx) => (
              <Card
                key={step.title}
                className="group border-slate-200/80 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-200">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {idx + 1}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="features"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="space-y-10"
        >
          <SectionTitle
            eyebrow="What you get"
            title="Sharp coaching-grade outputs for every mock"
            subtitle="Stay accountable with objective scoring, transcripts, and next steps."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
          <Card className="flex flex-col overflow-hidden border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/70 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Mini scorecard
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  See the scorecard your mentor wants to read.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Every interview ships with a dimension-by-dimension breakdown, calibrated notes,
                  and crisp recommendations. Export to PDF or share a link — no extra work.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Score by rubric</Badge>
                  <Badge>Transcript with highlights</Badge>
                  <Badge>Suggested rewrites</Badge>
                </div>
              </div>
              <SampleReportCard className="border-slate-200/80 dark:border-slate-800" />
            </div>
          </Card>
        </motion.section>

        <motion.section
          id="personas"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="space-y-8"
        >
          <SectionTitle
            eyebrow="Personas"
            title="Interview voices that mirror the real panel"
            subtitle="Switch personas to practice different interview styles. Professional Evaluator is active now."
            align="center"
          />
          <Tabs defaultValue="pro-evaluator">
            <TabsList>
              {personas.map((persona) => (
                <TabsTrigger key={persona.id} value={persona.id}>
                  {persona.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {personas.map((persona) => (
              <TabsContent key={persona.id} value={persona.id}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Card className="border-slate-200/80 p-6 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <Users className="h-4 w-4" />
                        {persona.title}
                      </div>
                      <Badge variant="outline" className="uppercase">
                        {persona.tag}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{persona.description}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <TagPill label="Behavioral depth" />
                      <TagPill label="Follow-up probing" />
                      <TagPill label="Role calibration" />
                      <TagPill label="Delivery coaching" />
                    </div>
                  </Card>
                  <SampleReportCard className="border-slate-200/80 dark:border-slate-800" />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.section>

        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="space-y-8"
        >
          <SectionTitle
            eyebrow="Pricing"
            title="Pick the prep cadence that fits"
            subtitle="Start free, then upgrade when you want more reps."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </motion.section>

        <motion.section
          id="faq"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="space-y-6"
        >
          <SectionTitle
            eyebrow="FAQ"
            title="Answers for the details people"
            subtitle="Still deciding? Here are the common questions."
            align="center"
          />
          <Accordion items={faqs} />
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-sm backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="mx-auto max-w-2xl space-y-4">
            <h3 className="text-3xl font-semibold">Ready to feel confident before your next loop?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Join the waitlist for early access and receive a sample scorecard with your resume.
            </p>
            <form className="mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Input type="email" placeholder="you@company.com" required className="sm:w-72" />
              <Button type="submit" className="sm:w-auto">
                Join the waitlist
              </Button>
            </form>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/80 py-6 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-slate-600 dark:text-slate-300 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <Sparkles className="h-4 w-4" />
            MockMate
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white">
              FAQ
            </a>
            <a href="mailto:hello@mockmate.ai" className="hover:text-slate-900 dark:hover:text-white">
              Contact
            </a>
          </div>
          <div>© {new Date().getFullYear()} MockMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <ArrowRight className="h-3 w-3" />
      {label}
    </div>
  );
}
