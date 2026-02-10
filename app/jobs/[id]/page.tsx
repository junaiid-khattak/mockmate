"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";
import { Mic, RefreshCw, Sparkles, Trash2 } from "lucide-react";

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

type InterviewSession = {
  id: string;
  performance_status: "pending" | "ready" | "failed" | null;
  performance_error: string | null;
  performance_updated_at: string | null;
  performance_overall_score: number | null;
  question_understanding_score: number | null;
  answer_correctness_score: number | null;
  reasoning_quality_score: number | null;
  followup_depth_score: number | null;
  communication_clarity_score: number | null;
  behavioral_story_quality_score: number | null;
  role_alignment_coverage_score: number | null;
  confidence_calibration_score: number | null;
  time_management_score: number | null;
  recovery_ability_score: number | null;
  performance_strengths: string[] | null;
  performance_growth_areas: string[] | null;
  performance_next_steps: string[] | null;
};

const POLL_INTERVAL_MS = 3000;


export default function JobBriefPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const interviewSessionId = searchParams.get("interview_id");
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(
    null,
  );
  const [interviewSessionLoading, setInterviewSessionLoading] = useState(false);
  const [interviewSessionError, setInterviewSessionError] = useState<string | null>(
    null,
  );

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

      let jd = await fetchJob();
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

      // Auto-trigger analysis if resume attached but analysis never started
      if (jd.resume_id && jd.fit_score_status == null) {
        try {
          const runRes = await fetch(`/api/jobs/${jobId}/analyze/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ force: false }),
          });
          if (runRes.ok) {
            jd = { ...jd, fit_score_status: "pending", questions_status: "pending" };
            if (!cancelled) setJob(jd);
          }
        } catch {
          // Silently fail — user can always re-trigger manually
        }
      }

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

  useEffect(() => {
    let cancelled = false;

    const loadInterviewSession = async () => {
      if (!interviewSessionId || checkingAuth) {
        setInterviewSession(null);
        setInterviewSessionError(null);
        setInterviewSessionLoading(false);
        return;
      }

      setInterviewSessionLoading(true);
      setInterviewSessionError(null);

      try {
        const res = await fetch(`/api/interviews/${interviewSessionId}`);
        const body = await res.json().catch(() => ({}));

        if (!res.ok || !body?.ok) {
          if (res.status === 404) {
            if (!cancelled) setInterviewSession(null);
            return;
          }
          throw new Error(body?.error ?? "Unable to load interview feedback.");
        }

        if (!cancelled) {
          setInterviewSession(body.interview as InterviewSession);
        }
      } catch (err) {
        if (!cancelled) {
          setInterviewSessionError(
            err instanceof Error ? err.message : "Unable to load interview feedback.",
          );
        }
      } finally {
        if (!cancelled) {
          setInterviewSessionLoading(false);
        }
      }
    };

    void loadInterviewSession();
    return () => {
      cancelled = true;
    };
  }, [interviewSessionId, checkingAuth]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        router.replace("/jobs");
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/analyze/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (res.ok) {
        // Reset job to pending state and restart polling
        setJob((prev) =>
          prev
            ? {
              ...prev,
              fit_score_status: "pending",
              fit_score: null,
              fit_score_error: null,
              fit_strong_alignment: null,
              fit_weak_spots: null,
              fit_areas_to_probe: null,
              questions_status: "pending",
              questions: null,
              questions_error: null,
            }
            : prev,
        );
      }
    } finally {
      setReanalyzing(false);
    }
  };

  const handleStartInterview = async () => {
    if (startingInterview) return;
    setInterviewError(null);
    setStartingInterview(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_seconds: 1800 }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok || typeof body.launch_url !== "string") {
        throw new Error(body?.error ?? "Unable to start interview.");
      }

      window.location.assign(body.launch_url);
    } catch (err) {
      setInterviewError(err instanceof Error ? err.message : "Unable to start interview.");
      setStartingInterview(false);
    }
  };

  if (checkingAuth) return null;

  if (loading) {
    return (
      <div className="text-slate-900">
        <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="text-slate-900">
        <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-slate-900">Job not found</h2>
          <p className="mt-2 text-sm text-slate-500">This job may have been deleted or doesn&apos;t belong to you.</p>
        </div>
      </div>
    );
  }

  const displayTitle = job.title || "Untitled position";
  const interviewMetricRows: Array<{ key: keyof InterviewSession; label: string }> = [
    { key: "question_understanding_score", label: "Question understanding" },
    { key: "answer_correctness_score", label: "Answer correctness" },
    { key: "reasoning_quality_score", label: "Reasoning quality" },
    { key: "followup_depth_score", label: "Depth under follow-ups" },
    { key: "communication_clarity_score", label: "Communication clarity" },
    { key: "behavioral_story_quality_score", label: "Behavioral story quality" },
    { key: "role_alignment_coverage_score", label: "Role alignment coverage" },
    { key: "confidence_calibration_score", label: "Confidence calibration" },
    { key: "time_management_score", label: "Time management" },
    { key: "recovery_ability_score", label: "Recovery ability" },
  ];

  return (
    <div className="text-slate-900">
      <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Title block */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {displayTitle}
            </h1>
            {confirmDelete ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete job"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {job.company && (
            <p className="mt-1 text-base text-slate-500">{job.company}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {resumeFilename && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1">
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
        <section className="mt-10 rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fit Score
          </h2>

          {job.fit_score_status === "ready" && job.fit_score != null ? (
            <>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-mm-violet">{job.fit_score}</span>
                <span className="text-lg text-slate-400">/ 10</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Based on resume-to-job alignment.
              </p>
            </>
          ) : job.fit_score_status === "pending" ? (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
              <span className="text-sm text-slate-500">Fit score pending</span>
            </div>
          ) : job.fit_score_status === "failed" ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">
                Unable to calculate fit score.{" "}
                {job.fit_score_error && (
                  <span className="text-slate-400">({job.fit_score_error})</span>
                )}
              </p>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reanalyzing ? "animate-spin" : ""}`} />
                {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Attach a resume to generate a fit score.
            </p>
          )}
        </section>

        {/* Strong Alignment — only when data exists */}
        {job.fit_strong_alignment && job.fit_strong_alignment.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Strong Alignment
            </h2>
            <ul className="mt-4 space-y-3">
              {job.fit_strong_alignment.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-emerald-500">
                    <path d="M13.3 4L6 11.3L2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Weak Spots — only when data exists */}
        {job.fit_weak_spots && job.fit_weak_spots.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
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
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Areas Likely to Be Probed — only when data exists */}
        {job.fit_areas_to_probe && job.fit_areas_to_probe.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Areas Likely to Be Probed
            </h2>
            <ul className="mt-4 space-y-3">
              {job.fit_areas_to_probe.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-slate-400">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 6.5C6 5.67 6.67 5 7.5 5H8.5C9.33 5 10 5.67 10 6.5C10 7.33 9.33 8 8.5 8H8V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Questions */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tailored Interview Questions
          </h2>

          {job.questions_status === "ready" && job.questions && job.questions.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {(job.questions as string[]).map((q, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mm-violet/[0.06] text-xs font-bold text-mm-violet">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">{q}</p>
                </li>
              ))}
            </ol>
          ) : job.questions_status === "pending" ? (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
              <span className="text-sm text-slate-500">Generating tailored questions...</span>
            </div>
          ) : job.questions_status === "failed" ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">
                Unable to generate questions.{" "}
                {job.questions_error && (
                  <span className="text-slate-400">({job.questions_error})</span>
                )}
              </p>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reanalyzing ? "animate-spin" : ""}`} />
                {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
              </button>
            </div>
          ) : null}
        </section>

        {interviewSessionId && (
          <section className="mt-10 rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Interview Performance
            </h2>

            {interviewSessionLoading ? (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
                <span className="text-sm text-slate-500">Loading performance metrics...</span>
              </div>
            ) : interviewSessionError ? (
              <p className="mt-4 text-sm text-rose-600">{interviewSessionError}</p>
            ) : interviewSession?.performance_status === "ready" ? (
              <>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold text-mm-violet">
                    {interviewSession.performance_overall_score ?? "--"}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">overall / 100</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {interviewMetricRows.map((row) => {
                    const value = interviewSession[row.key] as number | null;
                    return (
                      <div
                        key={String(row.key)}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <span className="text-xs text-slate-600">{row.label}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {value ?? "--"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {interviewSession.performance_strengths &&
                  interviewSession.performance_strengths.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Strengths
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {interviewSession.performance_strengths.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="text-sm text-slate-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {interviewSession.performance_growth_areas &&
                  interviewSession.performance_growth_areas.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Growth Areas
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {interviewSession.performance_growth_areas.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="text-sm text-slate-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {interviewSession.performance_next_steps &&
                  interviewSession.performance_next_steps.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Next Steps
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {interviewSession.performance_next_steps.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="text-sm text-slate-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : interviewSession?.performance_status === "pending" ? (
              <p className="mt-4 text-sm text-slate-500">
                Performance scoring is still running. Refresh in a few seconds.
              </p>
            ) : interviewSession?.performance_status === "failed" ? (
              <p className="mt-4 text-sm text-slate-500">
                We couldn&apos;t generate interview performance feedback yet.
                {interviewSession.performance_error && (
                  <span className="text-slate-400"> ({interviewSession.performance_error})</span>
                )}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No interview feedback found for this session yet.
              </p>
            )}
          </section>
        )}

        {/* Mock Interview CTA */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mm-violet/[0.06]">
            <Mic className="h-6 w-6 text-mm-violet" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Ready for a live mock interview?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Start a real-time interview session personalized to this job and your resume.
          </p>
          <button
            onClick={handleStartInterview}
            disabled={startingInterview || !job.resume_id}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-mm-violet px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {startingInterview ? "Starting..." : "Start Interview"}
          </button>
          {!job.resume_id && (
            <p className="mt-3 text-xs text-slate-500">Attach a resume before starting an interview.</p>
          )}
          {interviewError && (
            <p className="mt-3 text-xs text-rose-600">{interviewError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
