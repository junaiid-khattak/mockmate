"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/jobs/Header";
import { EmptyState } from "@/components/jobs/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import { StatsRow } from "@/components/jobs/StatsRow";
import { NudgeBanner } from "@/components/jobs/NudgeBanner";
import { CreditsBanner } from "@/components/jobs/CreditsBanner";
import {
  getJobsWithInterviewStats,
  computeDashboardStats,
  sortJobsForDashboard,
  type DashboardJob,
} from "@/lib/queries/dashboard";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function SkeletonCards() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[#e8e8ef] bg-white px-6 py-5"
        >
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-48 rounded bg-[#f2f2f7]" />
            <div className="h-3 w-32 rounded bg-[#f2f2f7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsLibraryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      const fallback = data.user.email?.split("@")[0] ?? "";
      const metaName = data.user.user_metadata?.first_name as string | undefined;
      setFirstName(metaName ?? fallback);
      setCheckingAuth(false);

      // Fetch credit balance (non-blocking)
      fetch("/api/billing/summary")
        .then((r) => r.json())
        .then((b) => {
          if (b?.ok && b.summary) setCreditBalance(b.summary.available_credits);
        })
        .catch(() => {});

      // Fetch jobs with aggregated interview stats
      const { jobs: loadedJobs, error } = await getJobsWithInterviewStats();
      if (!error && loadedJobs) {
        setJobs(loadedJobs);

        // Auto-trigger analysis for jobs with a resume but no analysis started
        const needsAnalysis = loadedJobs.filter(
          (j) => j.resume_id && j.fit_score_status == null
        );
        if (needsAnalysis.length > 0) {
          await Promise.allSettled(
            needsAnalysis.map((j) =>
              fetch(`/api/jobs/${j.id}/analyze/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: false }),
              })
            )
          );
          const triggered = new Set(needsAnalysis.map((j) => j.id));
          setJobs((prev) =>
            prev.map((j) =>
              triggered.has(j.id)
                ? { ...j, fit_score_status: "pending" as const }
                : j
            )
          );
        }
      }
      setLoading(false);
    };
    init();
  }, [router, supabase]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (checkingAuth) return null;

  // Dashboard state computations
  const stats = computeDashboardStats(jobs);
  const sortedJobs = sortJobsForDashboard(jobs);
  const isEmpty = jobs.length === 0;
  const hasInterviews = stats.totalInterviews > 0;
  const hasUnpracticedJobs = stats.jobsWithoutInterviews > 0;
  const creditsLow =
    creditBalance != null && creditBalance > 0 && creditBalance <= 3 && hasInterviews;
  const firstUnpracticedJobId = sortedJobs.find((j) => j.interview_count === 0)?.id;

  return (
    // Page background matches design's --bg: #f8f8fb
    <div className="min-h-screen bg-[#f8f8fb]">
      <Header
        firstName={firstName}
        creditBalance={creditBalance}
        onLogout={handleLogout}
      />

      {/* Inner content: max-w-4xl centered with 28px padding to match design */}
      <div className="mx-auto max-w-6xl px-8 py-7">
        {loading ? (
          // ── LOADING STATE ──
          <>
            <div className="mb-5 flex items-center justify-between">
              <div className="h-7 w-24 animate-pulse rounded bg-[#f2f2f7]" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-[#f2f2f7]" />
            </div>
            <SkeletonCards />
          </>
        ) : isEmpty ? (
          // ── EMPTY STATE ──
          <EmptyState />
        ) : (
          // ── POPULATED STATE ──
          <>
            {/* Stats row: only visible after user has done ≥1 interview */}
            {hasInterviews && (
              <StatsRow stats={stats} creditCount={creditBalance ?? 0} />
            )}

            {/* Nudge banner: has jobs but zero interviews total */}
            {!hasInterviews && hasUnpracticedJobs && (
              <NudgeBanner firstJobId={firstUnpracticedJobId} />
            )}

            {/* Credits low banner: 1–3 credits AND has done interviews */}
            {creditsLow && <CreditsBanner creditCount={creditBalance ?? 0} />}

            {/* Page header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-[-0.5px] text-[#111118]">
                Your Jobs
              </h2>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#7c5cfc] px-[22px] py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.2)] transition-all hover:bg-[#6341e0] hover:shadow-[0_4px_16px_rgba(124,92,252,0.3)]"
              >
                + Add a Job
              </Link>
            </div>

            {/* Job cards */}
            <div className="flex flex-col gap-4">
              {sortedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
