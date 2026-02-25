import Link from "next/link";
import { Fragment } from "react";

export function EmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
      {/* Microphone icon — purple gradient rounded square */}
      <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7c5cfc] to-[#9b82fd] text-[32px] shadow-[0_4px_24px_rgba(124,92,252,0.18)]">
        🎙️
      </div>

      <h2 className="mb-2 text-[26px] font-extrabold tracking-[-0.8px] text-[#111118]">
        Nail your first interview
      </h2>

      <p className="mb-7 max-w-[440px] text-[15px] leading-relaxed text-[#6b6b80]">
        Add a job you're targeting, upload your resume, and get a fit score +
        tailored questions — then practice with an AI mock interview.
      </p>

      {/* 3-step flow */}
      <div className="mb-9 flex items-start gap-8">
        {[
          { num: "1", text: ["Add a job &", "your resume"], highlight: false },
          { num: "2", text: ["Get fit score", "& questions"], highlight: false },
          { num: "3", text: ["Practice with", "AI interview"], highlight: true },
        ].map((step, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className="mt-[10px] text-lg text-[#e8e8ef]">→</span>
            )}
            <div className="flex w-[140px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(124,92,252,0.18)] bg-[rgba(124,92,252,0.06)] text-[13px] font-bold text-[#7c5cfc]">
                {step.num}
              </div>
              <div className="text-xs leading-[1.5] text-[#6b6b80]">
                {step.text[0]}
                <br />
                {step.highlight ? (
                  <strong className="font-bold text-[#7c5cfc]">
                    {step.text[1]}
                  </strong>
                ) : (
                  step.text[1]
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <Link
        href="/jobs/new"
        className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#6341e0] px-9 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(124,92,252,0.18)] transition-all hover:shadow-[0_6px_32px_rgba(124,92,252,0.25)]"
      >
        + Add Your First Job
      </Link>

      <p className="mt-[14px] text-xs text-[#9d9db0]">
        Free to start · Takes under 2 minutes
      </p>
    </div>
  );
}
