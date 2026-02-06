"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

type StateAssessmentReadyProps = {
  onStartEvaluation: () => void;
  onUpdateResume: () => void;
  onUpdateJob: () => void;
  hasJobDescription: boolean;
  greeting: string;
};

const MOCK_QUESTIONS = [
  {
    question:
      "You've listed distributed systems experience. Walk me through a specific scaling decision you made and the tradeoffs involved.",
    basis: "Systems experience claim",
  },
  {
    question:
      "Your resume mentions leading a team of four. Describe a disagreement within that team and how you resolved it.",
    basis: "Leadership experience",
  },
  {
    question:
      "You claim experience with event-driven architecture. How would you debug a message that was processed out of order?",
    basis: "Architecture claim",
  },
  {
    question:
      "Describe a time you had to make a significant technical tradeoff under time pressure. What did you sacrifice and why?",
    basis: "Decision-making depth",
  },
  {
    question:
      "Your resume references Go and microservices. How do you approach service boundaries when requirements are ambiguous?",
    basis: "Go & microservices experience",
  },
];

const MOCK_FIT = {
  score: 7,
  strengths: [
    "Backend systems experience matches core role requirements.",
    "Go proficiency directly relevant to the team's stack.",
    "Production ownership demonstrated across two recent roles.",
  ],
  gaps: [
    "No Kubernetes experience mentioned; the role lists it as required.",
    "Job description emphasizes GraphQL Federation; resume references REST only.",
    "Senior-level role expects mentorship examples; none provided.",
  ],
};

const INTERVIEW_FEATURES = [
  "45-minute deep-dive interview tailored to your resume",
  "Real-time evaluation across 6 performance dimensions",
  "Detailed scorecard with actionable improvement areas",
  "Specific feedback on confidence, clarity, and technical depth",
];

export function StateAssessmentReady({
  onStartEvaluation,
  onUpdateResume,
  onUpdateJob,
  hasJobDescription,
  greeting,
}: StateAssessmentReadyProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-10">
      {/* Greeting */}
      <h1 className="text-[28px] font-semibold tracking-tight text-mm-text">
        {greeting}
      </h1>
      <p className="mt-1 text-[15px] text-mm-muted">
        We&apos;ve analyzed your resume. Here&apos;s a preview of what interviewers will likely focus on.
      </p>

      {/* ── Likely Interview Questions ── */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-mm-text">
            Likely Interview Questions
          </h2>
          <span className="rounded-full bg-mm-violet/10 px-2.5 py-0.5 text-xs font-medium text-mm-violet">
            Free preview
          </span>
        </div>
        <p className="mt-1 text-sm text-mm-dim">
          Derived from your resume claims and experience signals.
        </p>

        <div className="mt-6 space-y-3">
          {MOCK_QUESTIONS.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <div className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] text-xs font-semibold text-mm-dim">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-[15px] font-medium leading-[1.7] text-mm-text">
                    &ldquo;{item.question}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-mm-dim">
                    Based on: {item.basis}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resume Fit (conditional) ── */}
      {hasJobDescription && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-mm-text">
            Resume Fit
          </h2>
          <p className="mt-1 text-sm text-mm-dim">
            How your background maps to the target role.
          </p>

          {/* Score */}
          <div className="mt-6 glass-card rounded-xl p-6">
            <div className="flex items-baseline gap-1.5">
              <span className="gradient-text text-5xl font-bold">
                {MOCK_FIT.score}
              </span>
              <span className="text-lg text-mm-dim font-medium">/ 10</span>
            </div>
            <p className="mt-2 text-sm text-mm-muted">
              Overall alignment between your experience and the role requirements.
            </p>
          </div>

          {/* Strengths */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-mm-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-emerald" />
              Strong alignment
            </h3>
            <ul className="mt-3 space-y-2.5">
              {MOCK_FIT.strengths.map((point, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-[15px] leading-relaxed text-mm-text/80"
                >
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-mm-emerald/50" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-mm-amber">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-amber" />
              Areas likely to be probed
            </h3>
            <ul className="mt-3 space-y-2.5">
              {MOCK_FIT.gaps.map((point, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-[15px] leading-relaxed text-mm-text/80"
                >
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-mm-amber/50" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Conversion Zone: Full Interview CTA ── */}
      <section className="mt-16">
        <div className="gradient-border overflow-hidden rounded-2xl">
          <div className="relative bg-[rgba(124,92,252,0.04)] p-8">
            {/* Subtle shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 shimmer rounded-2xl" />

            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-mm-text">
                Ready to test yourself?
              </h2>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-mm-muted">
                A 45-minute live evaluation that mirrors real interview conditions.
                You&apos;ll receive a detailed scorecard when it&apos;s over.
              </p>

              {/* Feature list */}
              <ul className="mt-5 space-y-2.5">
                {INTERVIEW_FEATURES.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-mm-text/70"
                  >
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-mm-violet" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <button
                  type="button"
                  onClick={onStartEvaluation}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-cta px-7 py-3.5 text-[15px] font-semibold text-white transition-all glow-accent hover:glow-accent-hover"
                >
                  <span>Begin Full Evaluation</span>
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-mm-text">$5</span>
                  <span className="text-sm text-mm-dim">per session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Secondary actions ── */}
      <div className="mt-12 flex items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={onUpdateResume}
          className="text-mm-dim transition-colors hover:text-mm-muted"
        >
          Update resume
        </button>
        <span className="text-mm-dim/30">&middot;</span>
        <button
          type="button"
          onClick={onUpdateJob}
          className="text-mm-dim transition-colors hover:text-mm-muted"
        >
          {hasJobDescription ? "Update job description" : "Add job description"}
        </button>
      </div>
    </div>
  );
}
