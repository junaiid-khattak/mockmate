"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";
import { EmptyState } from "@/components/jobs/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";

type JobSummary = {
  id: string;
  title: string | null;
  company: string | null;
  resume_id: string | null;
  fit_score: number | null;
  fit_score_status: "pending" | "ready" | "failed" | null;
  updated_at: string;
};

export default function JobsLibraryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
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

      // Fetch credit balance for header
      fetch("/api/billing/summary")
        .then((r) => r.json())
        .then((b) => {
          if (b?.ok && b.summary) setCreditBalance(b.summary.available_credits);
        })
        .catch(() => {});

      const res = await fetch("/api/jobs?limit=50");
      const body = await res.json().catch(() => ({}));
      if (body?.ok) {
        const loaded: JobSummary[] = body.jobs ?? [];
        setJobs(loaded);

        // Auto-trigger analysis for jobs with a resume but no analysis started
        const needsAnalysis = loaded.filter(
          (j) => j.resume_id && j.fit_score_status == null,
        );
        if (needsAnalysis.length > 0) {
          // Fire all triggers in parallel, then mark them as pending in UI
          await Promise.allSettled(
            needsAnalysis.map((j) =>
              fetch(`/api/jobs/${j.id}/analyze/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: false }),
              }),
            ),
          );
          const triggered = new Set(needsAnalysis.map((j) => j.id));
          setJobs((prev) =>
            prev.map((j) =>
              triggered.has(j.id)
                ? { ...j, fit_score_status: "pending" as const }
                : j,
            ),
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

  return (
    <div className="text-slate-900">
      <Header firstName={firstName} creditBalance={creditBalance} onLogout={handleLogout} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Your jobs
              </h1>
              <Link
                href="/jobs/new"
                className="inline-flex items-center rounded-lg bg-mm-violet px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600"
              >
                Add a job
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  resumeId={job.resume_id}
                  updatedAt={job.updated_at}
                  fitScore={job.fit_score}
                  fitScoreStatus={job.fit_score_status}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
