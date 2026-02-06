"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type StateContextGatheringProps = {
  resumeFilename: string;
  onAnalyze: (jobDescription: string) => void;
  onSkip: () => void;
};

export function StateContextGathering({
  resumeFilename,
  onAnalyze,
  onSkip,
}: StateContextGatheringProps) {
  const [jobDescription, setJobDescription] = useState("");

  const canSubmit = jobDescription.trim().length >= 50;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col justify-center px-6 py-12">
      {/* Resume confirmed badge */}
      <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-mm-emerald/20 bg-mm-emerald/10 px-4 py-1.5">
        <CheckCircleIcon className="h-4 w-4 text-mm-emerald" />
        <span className="text-xs font-medium text-mm-emerald">
          Resume received
        </span>
      </div>

      {/* Step indicator */}
      <div className="mb-4 inline-flex w-fit items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5">
        <span className="text-xs font-medium tracking-wide text-mm-muted">
          Step 2 of 2 &mdash; Optional
        </span>
      </div>

      <h1 className="mb-3 text-[32px] font-semibold leading-tight tracking-tight text-mm-text">
        What role are you preparing for?
      </h1>

      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-mm-muted">
        Paste the job description and we&apos;ll tailor questions to the specific
        role. This also unlocks a resume-to-job fit analysis.
      </p>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="h-64 w-full resize-none rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 text-[15px] leading-relaxed text-mm-text outline-none transition-all placeholder:text-mm-dim focus:border-mm-violet/40 focus:ring-1 focus:ring-mm-violet/20"
        />
        {jobDescription.length > 0 && (
          <span className="absolute bottom-3 right-4 text-xs text-mm-dim">
            {jobDescription.length} chars
          </span>
        )}
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={() => onAnalyze(jobDescription)}
        disabled={!canSubmit}
        className="mt-6 w-full rounded-xl bg-gradient-cta px-6 py-3.5 text-[15px] font-medium text-white transition-all glow-accent hover:glow-accent-hover disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
      >
        Analyze match
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="mx-auto mt-5 block text-sm text-mm-dim transition-colors hover:text-mm-muted"
      >
        Skip &mdash; just use my resume
      </button>
    </div>
  );
}
