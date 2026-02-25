"use client";

import { useRouter } from "next/navigation";
import type { DashboardJob } from "@/lib/queries/dashboard";
import { MiniProgressBar } from "./MiniProgressBar";
import { InterviewStatusChip } from "./InterviewStatusChip";

interface JobCardProps {
  job: DashboardJob;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const displayTitle = job.title || "Untitled position";

  const formattedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const needsAttention = job.interview_count === 0;

  // Fit score is stored 0-10 in the jobs table (unlike interview scores which are 0-100)
  const fitScoreGreen = job.fit_score != null && job.fit_score >= 8;

  // Best score color
  const bestScoreColor =
    job.best_score != null
      ? job.best_score >= 80
        ? "text-green-600"
        : "text-amber-600"
      : "text-[#6b6b80]";

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-xl border border-[#e8e8ef] bg-white px-8 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-[rgba(124,92,252,0.18)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-px"
      style={needsAttention ? { borderLeftWidth: "3px", borderLeftColor: "#7c5cfc" } : undefined}
    >
      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[1fr_auto_auto]">
        {/* ── Column 1: Job Info ── */}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-[-0.4px] text-[#111118] transition-colors group-hover:text-[#7c5cfc]">
            {displayTitle}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px] text-[#6b6b80]">
            {job.company && <span>{job.company}</span>}
            {job.company && (
              <span className="inline-block h-[3px] w-[3px] rounded-full bg-[#e8e8ef]" />
            )}
            <span>{job.resume_id ? "📄 Resume attached" : "No resume"}</span>
            <span className="inline-block h-[3px] w-[3px] rounded-full bg-[#e8e8ef]" />
            <span>Added {formattedDate}</span>
          </div>

          {/* Mini progress bar: only when ≥2 interviews */}
          {job.interview_count >= 2 &&
            job.first_score != null &&
            job.best_score != null &&
            job.improvement != null && (
              <MiniProgressBar
                firstScore={job.first_score}
                bestScore={job.best_score}
                improvement={job.improvement}
                interviewCount={job.interview_count}
              />
            )}
        </div>

        {/* ── Column 2: Status Indicators ── */}
        <div className="flex items-center gap-5">
          {/* Fit Score Pill */}
          {job.fit_score_status === "ready" && job.fit_score != null && (
            <div
              className={[
                "inline-flex flex-col items-center rounded-lg border px-3.5 py-2",
                fitScoreGreen
                  ? "border-[rgba(22,163,74,0.15)] bg-[rgba(22,163,74,0.08)]"
                  : "border-[rgba(217,119,6,0.15)] bg-[rgba(217,119,6,0.07)]",
              ].join(" ")}
            >
              <div
                className={`text-xl font-extrabold leading-none ${fitScoreGreen ? "text-green-600" : "text-amber-600"}`}
              >
                {job.fit_score}/10
              </div>
              <div
                className={`text-[10px] font-semibold uppercase leading-none tracking-[0.8px] ${fitScoreGreen ? "text-green-600" : "text-amber-600"}`}
              >
                Fit
              </div>
            </div>
          )}

          {/* Best Score — only if interviews exist */}
          {job.interview_count > 0 && job.best_score != null && (
            <div className="text-center">
              <div className={`text-[26px] font-extrabold leading-none ${bestScoreColor}`}>
                {(job.best_score / 10).toFixed(1)}
              </div>
              <div className="mt-0.5 text-[10px] text-[#9d9db0]">Best Score</div>
            </div>
          )}

          {/* Interview Status Chip */}
          <InterviewStatusChip
            status={job.interview_count > 0 ? "practiced" : "none"}
            interviewCount={job.interview_count}
            questionsReady={job.questions_count}
            lastInterviewAt={job.last_interview_at}
          />
        </div>

        {/* ── Column 3: Actions ── */}
        <div className="flex items-center gap-2.5">
          {job.interview_count === 0 ? (
            <button
              onClick={handleButtonClick}
              className="whitespace-nowrap rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#6341e0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.2)] transition-all hover:shadow-[0_4px_16px_rgba(124,92,252,0.3)]"
            >
              Start Interview
            </button>
          ) : (
            <>
              <button
                onClick={handleButtonClick}
                className="whitespace-nowrap rounded-lg border border-[#e8e8ef] bg-[#f2f2f7] px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#e8e8ef]"
              >
                View Results
              </button>
              <button
                onClick={handleButtonClick}
                className="whitespace-nowrap rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#6341e0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.2)] transition-all hover:shadow-[0_4px_16px_rgba(124,92,252,0.3)]"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
