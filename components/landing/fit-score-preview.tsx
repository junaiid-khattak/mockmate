"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

type Props = { className?: string };

const SCORE = 7.4;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const strongAlignment = [
  "5+ years React & TypeScript experience",
  "Led cross-functional product teams",
  "Shipped production ML features",
];

const weakSpots = [
  "No explicit Kubernetes / infrastructure experience",
  "Job requires 2+ years people management",
];

const areasToProbe = [
  "System design at scale (100M+ users)",
  "Experience with A/B testing frameworks",
];

export function FitScorePreview({ className }: Props) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 bg-white shadow-xl",
        className,
      )}
    >
      <CardHeader className="space-y-3 bg-gradient-to-r from-slate-50 to-white pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-mm-violet" />
            nayld.ai Fit Analysis
          </div>
          <Badge className="border-mm-violet/20 bg-mm-violet/[0.06] text-mm-violet text-[10px]">
            AI Generated
          </Badge>
        </div>
        <div>
          <CardTitle className="text-lg text-slate-900">
            Senior Frontend Engineer
          </CardTitle>
          <p className="mt-0.5 text-sm text-slate-500">Stripe &middot; San Francisco</p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={RADIUS}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={RADIUS}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                whileInView={{
                  strokeDashoffset: CIRCUMFERENCE * (1 - SCORE / 10),
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
              <defs>
                <linearGradient
                  id="scoreGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#7C5CFC" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <span className="text-2xl font-bold text-slate-900">{SCORE}</span>
              <span className="text-sm text-slate-400">/10</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Strong Match</p>
            <p className="text-xs text-slate-500">
              Your profile aligns well with this role
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <Separator />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Strong Alignment
          </p>
          <ul className="space-y-1.5">
            {strongAlignment.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Weak Spots
          </p>
          <ul className="space-y-1.5">
            {weakSpots.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Likely Interview Focus
          </p>
          <ul className="space-y-1.5">
            {areasToProbe.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
