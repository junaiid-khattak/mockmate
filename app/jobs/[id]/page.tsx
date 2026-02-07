"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";

type Job = {
  id: string;
  title: string | null;
  company: string | null;
  content: string;
  source_url: string | null;
  resume_id: string | null;
  fit_score: number | null;
  fit_score_status: "pending" | "ready" | "failed" | null;
  fit_score_error: string | null;
  fit_strong_alignment: string[] | null;
  fit_weak_spots: string[] | null;
  fit_areas_to_probe: string[] | null;
  questions: unknown[] | null;
  questions_status: "pending" | "ready" | "failed" | null;
  questions_error: string | null;
  created_at: string;
  updated_at: string;
};

const POLL_INTERVAL_MS = 3000;


export default function JobBriefPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchJob = async (): Promise<Job | null> => {
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      const jobBody = await jobRes.json().catch(() => ({}));
      if (!jobRes.ok || !jobBody?.ok) return null;
      return jobBody.job as Job;
    };

    const needsPolling = (j: Job) =>
      j.fit_score_status === "pending" || j.questions_status === "pending";

    const poll = async () => {
      const updated = await fetchJob();
      if (cancelled || !updated) return;
      setJob(updated);
      if (needsPolling(updated)) {
        pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

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

      const jd = await fetchJob();
      if (cancelled) return;
      if (!jd) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setJob(jd);

      // Fetch resume filename if linked
      if (jd.resume_id) {
        const resumeRes = await fetch(`/api/files/${jd.resume_id}`);
        const resumeBody = await resumeRes.json().catch(() => ({}));
        if (resumeBody?.ok) {
          setResumeFilename(resumeBody.filename ?? null);
        }
      }

      setLoading(false);

      // Start polling if analysis is pending
      if (needsPolling(jd)) {
        pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };
    init();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [router, supabase, jobId]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (checkingAuth) return null;

  if (loading) {
    return (
      <div className="text-gray-900">
        <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-mm-violet" />
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="text-gray-900">
        <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-gray-900">Job not found</h2>
          <p className="mt-2 text-sm text-gray-500">This job may have been deleted or doesn&apos;t belong to you.</p>
        </div>
      </div>
    );
  }

  const displayTitle = job.title || "Untitled position";

  return (
    <div className="text-gray-900">
      <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Title block */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {displayTitle}
          </h1>
          {job.company && (
            <p className="mt-1 text-base text-gray-500">{job.company}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {resumeFilename && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M7 1H3C2.44772 1 2 1.44772 2 2V10C2 10.5523 2.44772 11 3 11H9C9.55228 11 10 10.5523 10 10V4L7 1Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {resumeFilename}
              </span>
            )}
            {job.source_url && (
              <a
                href={job.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mm-violet hover:underline"
              >
                View original posting
              </a>
            )}
          </div>
        </div>

        {/* Fit Score */}
        <section className="mt-10 rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Fit Score
          </h2>

          {job.fit_score_status === "ready" && job.fit_score != null ? (
            <>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-mm-violet">{job.fit_score}</span>
                <span className="text-lg text-gray-400">/ 10</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Based on resume-to-job alignment.
              </p>
            </>
          ) : job.fit_score_status === "pending" ? (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-mm-violet" />
              <span className="text-sm text-gray-500">Fit score pending</span>
            </div>
          ) : job.fit_score_status === "failed" ? (
            <p className="mt-4 text-sm text-gray-500">
              Unable to calculate fit score.{" "}
              {job.fit_score_error && (
                <span className="text-gray-400">({job.fit_score_error})</span>
              )}
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              Attach a resume to generate a fit score.
            </p>
          )}
        </section>

        {/* Strong Alignment — only when data exists */}
        {job.fit_strong_alignment && job.fit_strong_alignment.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Strong Alignment
            </h2>
            <ul className="mt-4 space-y-3">
              {job.fit_strong_alignment.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-emerald-500">
                    <path d="M13.3 4L6 11.3L2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Weak Spots — only when data exists */}
        {job.fit_weak_spots && job.fit_weak_spots.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Weak Spots
            </h2>
            <ul className="mt-4 space-y-3">
              {job.fit_weak_spots.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-amber-500">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Areas Likely to Be Probed — only when data exists */}
        {job.fit_areas_to_probe && job.fit_areas_to_probe.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Areas Likely to Be Probed
            </h2>
            <ul className="mt-4 space-y-3">
              {job.fit_areas_to_probe.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-gray-400">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 6.5C6 5.67 6.67 5 7.5 5H8.5C9.33 5 10 5.67 10 6.5C10 7.33 9.33 8 8.5 8H8V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <button
            disabled
            className="w-full rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            Start Interview — Coming soon
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            Live mock interviews are being built. Your brief is saved and ready.
          </p>
        </div>
      </div>
    </div>
  );
}
