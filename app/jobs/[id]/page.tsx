"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";
import { RefreshCw, Trash2 } from "lucide-react";
import { CollapsibleCard } from "@/components/jobs/CollapsibleCard";
import { InterviewCTACard } from "@/components/jobs/InterviewCTACard";
import { CreditsCard } from "@/components/jobs/CreditsCard";
import { StickyBottomBar } from "@/components/jobs/StickyBottomBar";
import { InterviewResultsHero } from "@/components/jobs/InterviewResultsHero";
import { Recommendations } from "@/components/jobs/Recommendations";
import { InterviewTranscript } from "@/components/jobs/InterviewTranscript";
import { RetryCTACard } from "@/components/jobs/RetryCTACard";
import { InterviewHistoryCard } from "@/components/jobs/InterviewHistoryCard";
import { CompareAttemptsTable } from "@/components/jobs/CompareAttemptsTable";
import { CompareBanner } from "@/components/jobs/CompareBanner";
import { ShareInterviewButton } from "@/components/jobs/ShareInterviewButton";
import { PreviewResultsTeaser } from "@/components/jobs/PreviewResultsTeaser";
import { getUserDisplayFirstName } from "@/lib/auth/user-name";

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
  analysis_run_id: string | null;
  interview_date: string | null;
  created_at: string;
  updated_at: string;
};

type InterviewSession = {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_file_id: string | null;
  attempt_number: number;
  mode: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  overall_score: number | null;
  summary: string | null;
  // Performance metrics (0-100)
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
  performance_overall_score: number | null;
  performance_feedback: unknown | null;
  performance_strengths: string[] | null;
  performance_growth_areas: string[] | null;
  performance_next_steps: string[] | null;
  performance_status: "pending" | "ready" | "failed" | null;
  performance_version: string | null;
  performance_error: string | null;
  performance_updated_at: string | null;
  // New multi-attempt fields
  transcript: Array<{ speaker: "ai" | "user"; message: string; timestamp?: string }> | null;
  recommendations: Array<{ type: "improve" | "strength" | "refine"; text: string }> | null;
  // Sharing
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
};

const POLL_INTERVAL_MS = 3000;

export default function JobBriefPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const interviewSessionId = searchParams.get("interview_id");
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const posthog = usePostHog();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [resumeExtractionStatus, setResumeExtractionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [showInterviewPaywall, setShowInterviewPaywall] = useState(false);
  const [interviewPaywallMessage, setInterviewPaywallMessage] = useState<string | null>(
    null,
  );
  const [paywallPurchaseMessage, setPaywallPurchaseMessage] = useState<string | null>(
    null,
  );
  const [paywallCheckingOut, setPaywallCheckingOut] = useState<string | null>(null);
  const [paywallHasSubscription, setPaywallHasSubscription] = useState(false);
  const [paywallCreditPriceCents, setPaywallCreditPriceCents] = useState<number | null>(null);
  const [paywallCanBuyCredits, setPaywallCanBuyCredits] = useState(false);
  const [addonBuyQuantity, setAddonBuyQuantity] = useState(1);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(
    null,
  );
  const [interviewSessionLoading, setInterviewSessionLoading] = useState(false);
  const [interviewSessionError, setInterviewSessionError] = useState<string | null>(
    null,
  );
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [activeAttemptNumber, setActiveAttemptNumber] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

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
      try {
        const updated = await fetchJob();
        if (cancelled || !updated) return;
        setJob(updated);
        if (needsPolling(updated)) {
          pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        // Transient fetch error — retry after the interval
        if (!cancelled) pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      setFirstName(getUserDisplayFirstName(data.user));
      setCheckingAuth(false);

      // Fetch credit balance for header
      fetch("/api/billing/summary")
        .then((r) => r.json())
        .then((b) => {
          if (b?.ok && b.summary) setCreditBalance(b.summary.available_credits);
        })
        .catch(() => { });

      let jd = await fetchJob();
      if (cancelled) return;
      if (!jd) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setJob(jd);

      // Fetch resume filename + extraction status if linked
      let resumeExtracted = false;
      if (jd.resume_id) {
        const resumeRes = await fetch(`/api/files/${jd.resume_id}`);
        const resumeBody = await resumeRes.json().catch(() => ({}));
        if (resumeBody?.ok) {
          setResumeFilename(resumeBody.filename ?? null);
          setResumeExtractionStatus(resumeBody.extractedTextStatus ?? null);
          resumeExtracted = resumeBody.extractedTextStatus === "successful";
        }
      }

      setLoading(false);

      // Auto-trigger analysis when:
      //  • a resume is attached, AND
      //  • no analysis has been started yet (analysis_run_id is null), AND
      //  • the resume is already extracted (extraction worker won't re-fire for it)
      // When extraction is still in progress we skip — the extraction Lambda
      // will send the SQS message itself once it finishes.
      if (jd.resume_id && !jd.analysis_run_id && resumeExtracted) {
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
          const msg = err instanceof Error ? err.message : "Unable to load interview feedback.";
          setInterviewSessionError(msg);
          posthog.capture("client_error", { error_message: msg, page: `/jobs/${jobId}`, action: "load_interview_session" });
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

  // Fetch all interviews for this job
  useEffect(() => {
    let cancelled = false;

    const fetchInterviews = async () => {
      if (checkingAuth || !job) return;

      setInterviewsLoading(true);

      try {
        const res = await fetch(`/api/jobs/${jobId}/interviews`);
        const body = await res.json().catch(() => ({}));

        if (!cancelled && res.ok && body?.ok && Array.isArray(body.interviews)) {
          const fetchedInterviews = body.interviews as InterviewSession[];
          setInterviews(fetchedInterviews);

          // Set active attempt to the latest (highest attempt number) by default
          if (fetchedInterviews.length > 0 && activeAttemptNumber === null) {
            const latestAttempt = Math.max(
              ...fetchedInterviews.map((i) => i.attempt_number)
            );
            setActiveAttemptNumber(latestAttempt);
          }
        }
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
        posthog.capture("client_error", { error_message: "Failed to fetch interviews", page: `/jobs/${jobId}`, cause: String(err) });
      } finally {
        if (!cancelled) {
          setInterviewsLoading(false);
        }
      }
    };

    void fetchInterviews();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth, job, jobId, activeAttemptNumber]);

  // Scroll detection for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const startInterview = async (): Promise<
    | { ok: true; launchUrl: string }
    | {
      ok: false;
      code: "payment_required" | "error";
      message: string;
      has_subscription?: boolean;
      credit_price_cents?: number;
      can_buy_credits?: boolean;
    }
  > => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_seconds: 1800 }),
      });

      const body = await res.json().catch(() => ({}));
      if (res.status === 402 || body?.error === "payment_required") {
        return {
          ok: false,
          code: "payment_required",
          message:
            typeof body?.message === "string" && body.message.trim()
              ? body.message
              : "You need at least one interview credit to start this interview.",
          has_subscription: body?.has_subscription,
          credit_price_cents: body?.credit_price_cents,
          can_buy_credits: body?.can_buy_credits,
        };
      }

      if (!res.ok || !body?.ok || typeof body.launch_url !== "string") {
        return {
          ok: false,
          code: "error",
          message:
            typeof body?.message === "string"
              ? body.message
              : body?.error ?? "Unable to start interview.",
        };
      }

      return { ok: true, launchUrl: body.launch_url };
    } catch (err) {
      posthog.capture("client_error", { error_message: "Unable to start interview.", page: `/jobs/${jobId}`, action: "start_interview", cause: String(err) });
      return {
        ok: false,
        code: "error",
        message: err instanceof Error ? err.message : "Unable to start interview.",
      };
    }
  };

  const handleStartInterview = async () => {
    if (startingInterview) return;
    setInterviewError(null);

    // Check balance client-side first for UX
    try {
      const balanceRes = await fetch("/api/billing/summary");
      const balanceBody = await balanceRes.json().catch(() => ({}));
      const credits = balanceBody?.summary?.available_credits ?? 0;
      setCreditBalance(credits);

      const subscriptionRes = await fetch("/api/billing/subscription/status");
      const subscriptionBody = await subscriptionRes.json().catch(() => ({}));
      const subscriptionCredits = subscriptionBody?.sessions_limit - subscriptionBody?.sessions_used;
      const addOnCredits = subscriptionBody?.addon_credits - subscriptionBody?.sessions_used;

      if (credits < 1 && subscriptionCredits < 1 && addOnCredits < 1) {
        setInterviewPaywallMessage(
          "You need at least one interview credit to start this interview.",
        );
        setShowInterviewPaywall(true);
        return;
      }

      handleConfirmStartInterview();
      // Show confirmation dialog
      // setShowCreditConfirm(true);
    } catch (err) {
      setInterviewError("Unable to check credit balance.");
      posthog.capture("client_error", { error_message: "Unable to check credit balance.", page: `/jobs/${jobId}`, action: "check_credits", cause: String(err) });
    }
  };

  const handleConfirmStartInterview = async () => {
    setShowCreditConfirm(false);
    setStartingInterview(true);
    setInterviewError(null);

    const result = await startInterview();

    if (result.ok) {
      window.location.assign(result.launchUrl);
      return;
    }

    if (result.code === "payment_required") {
      setInterviewPaywallMessage(result.message);
      setPaywallHasSubscription(result.has_subscription ?? false);
      setPaywallCreditPriceCents(result.credit_price_cents ?? null);
      setPaywallCanBuyCredits(result.can_buy_credits ?? false);
      setAddonBuyQuantity(1);
      setShowInterviewPaywall(true);
      setStartingInterview(false);
      return;
    }

    setInterviewError(result.message);
    setStartingInterview(false);
  };

  const handlePaywallBuy = async (packId: string) => {
    setPaywallCheckingOut(packId);
    setPaywallPurchaseMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
      const body = await res.json().catch(() => ({}));
      if (body?.ok && body.checkout_url) {
        window.location.assign(body.checkout_url);
        return;
      }
      const msg = body?.error ?? "Unable to start checkout.";
      setPaywallPurchaseMessage(msg);
      posthog.capture("client_error", { error_message: msg, page: `/jobs/${jobId}`, action: "paywall_buy" });
    } catch (err) {
      setPaywallPurchaseMessage("Unable to start checkout.");
      posthog.capture("client_error", { error_message: "Unable to start checkout.", page: `/jobs/${jobId}`, action: "paywall_buy", cause: String(err) });
    } finally {
      setPaywallCheckingOut(null);
    }
  };

  const handleBuyAddonCredits = async (quantity: number) => {
    setPaywallCheckingOut("addon");
    setPaywallPurchaseMessage(null);
    try {
      const res = await fetch("/api/billing/credits/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const body = await res.json().catch(() => ({}));
      if (body?.ok && body.checkout_url) {
        window.location.assign(body.checkout_url);
        return;
      }
      const msg = body?.message ?? body?.error ?? "Unable to start checkout.";
      setPaywallPurchaseMessage(msg);
      posthog.capture("client_error", { error_message: msg, page: `/jobs/${jobId}`, action: "buy_addon_credits" });
    } catch (err) {
      setPaywallPurchaseMessage("Unable to start checkout.");
      posthog.capture("client_error", { error_message: "Unable to start checkout.", page: `/jobs/${jobId}`, action: "buy_addon_credits", cause: String(err) });
    } finally {
      setPaywallCheckingOut(null);
    }
  };

  if (checkingAuth) return null;

  if (loading) {
    return (
      <div className="text-slate-900">
        <Header firstName={firstName} creditBalance={creditBalance} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="text-slate-900">
        <Header firstName={firstName} creditBalance={creditBalance} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />
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

  // Helper function to generate dynamic performance summary
  const generatePerformanceSummary = (
    currentInterview: InterviewSession,
    allInterviews: InterviewSession[],
  ): string => {
    const metrics = interviewMetricRows.map((metric) => ({
      key: metric.key,
      label: metric.label,
      score: (currentInterview[metric.key] as number | null) ?? 0,
    }));

    // Find top 2 strengths and areas for improvement
    const sortedByScore = [...metrics].sort((a, b) => b.score - a.score);
    const topStrengths = sortedByScore.slice(0, 2).filter((m) => m.score >= 70);
    const areasForImprovement = [...metrics]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .filter((m) => m.score < 80);

    // Check if there's a previous attempt to compare
    const previousAttempt = allInterviews.find(
      (i) => i.attempt_number === currentInterview.attempt_number - 1,
    );

    let summary = "";

    // Add comparison if this is not the first attempt
    if (previousAttempt && previousAttempt.performance_overall_score !== null) {
      const scoreDiff =
        (currentInterview.performance_overall_score ?? 0) -
        (previousAttempt.performance_overall_score ?? 0);
      const scoreDiffScaled = scoreDiff / 10;

      if (scoreDiff > 5) {
        summary += `Great improvement! Score increased by ${Math.abs(scoreDiffScaled).toFixed(1)} points. `;
      } else if (scoreDiff < -5) {
        summary += `Score decreased by ${Math.abs(scoreDiffScaled).toFixed(1)} points. `;
      } else {
        summary += "Consistent performance compared to last attempt. ";
      }
    }

    // Add strengths
    if (topStrengths.length > 0) {
      const strengthsText = topStrengths
        .map((s) => `${s.label} (${(s.score / 10).toFixed(1)}/10)`)
        .join(" and ");
      summary += `Strong performance in ${strengthsText}. `;
    }

    // Add areas for improvement
    if (areasForImprovement.length > 0) {
      const improvementText = areasForImprovement
        .map((s) => `${s.label} (${(s.score / 10).toFixed(1)}/10)`)
        .join(" and ");
      summary += `Focus on improving ${improvementText}.`;
    }

    return summary.trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Header firstName={firstName} creditBalance={creditBalance} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />

      {/* Page body with padding */}
      <div className="px-7 py-7 pb-24">
        {/* Job Header - full width */}
        <div className="mb-6 flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                {displayTitle}
              </h2>
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
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              {job.company && (
                <>
                  <span>{job.company}</span>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                </>
              )}
              {resumeFilename && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-xs">
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
                  className="text-purple-600 hover:underline"
                >
                  View posting →
                </a>
              )}
            </div>
          </div>

          {/* Fit Score Badge - inline on the right */}
          {job.fit_score != null && job.fit_score_status === "ready" && (() => {
            const score = job.fit_score!;
            const isStrong = score >= 8;
            const isModerate = score >= 6.5 && score < 8;
            const label = isStrong
              ? "Strong fit — but gaps remain"
              : isModerate
                ? "Moderate fit — key gaps to close"
                : "Weak fit — significant gaps found";
            const colorClass = isStrong ? "text-green-600" : "text-amber-600";
            const borderClass = isStrong ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50";
            return (
              <div className={`flex items-center gap-3.5 rounded-xl border px-5 py-3 ${borderClass}`}>
                <div className={`text-4xl font-extrabold leading-none tracking-tighter ${colorClass}`}>
                  {score}
                  <sub className="text-base font-medium text-gray-500">/10</sub>
                </div>
                <div>
                  <div className={`text-sm font-semibold ${colorClass}`}>{label}</div>
                  <div className="text-xs text-gray-500">Resume-to-job alignment</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Resume parse error — shown when the attached resume could not be extracted */}
        {job.resume_id && resumeExtractionStatus === "failed" && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-800">We couldn't read your resume.</p>
            <p className="mt-1 text-sm text-red-700">
              The file may be corrupted, password-protected, or an unsupported format. Please upload a new{" "}
              <strong>PDF or DOCX</strong> file, then re-link it to this job.
            </p>
            <a
              href="/resumes"
              className="mt-3 inline-block rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Manage resumes →
            </a>
          </div>
        )}

        {/* Combined gap + urgency banner — shown when fit score is ready and no interviews done */}
        {job.fit_score != null && job.fit_score_status === "ready" && interviews.length === 0 && (() => {
          const daysUntil = job.interview_date
            ? Math.ceil((new Date(job.interview_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          const showUrgency = daysUntil !== null && daysUntil >= 0 && daysUntil <= 14;
          const urgencyColor = showUrgency && daysUntil! <= 3 ? "text-red-600" : "text-amber-600";
          return (
            <div className="mb-6 rounded-xl border border-[rgba(124,92,252,0.2)] bg-gradient-to-r from-[rgba(124,92,252,0.05)] to-[rgba(124,92,252,0.02)] px-5 py-4">
              {showUrgency && (
                <p className={`mb-2 text-xs font-semibold ${urgencyColor}`}>
                  ⏱ Your interview is in {daysUntil === 0 ? "less than a day" : `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                  {job.company ? ` at ${job.company}` : ""} — start practicing now.
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-[#111118]">
                    You scored <span className="text-[#7c5cfc]">{job.fit_score}/10</span> for this role.
                    {job.fit_weak_spots && job.fit_weak_spots.length > 0 && (
                      <> Your biggest gaps: <span className="font-bold">{job.fit_weak_spots.slice(0, 2).join(" and ")}</span>.</>
                    )}
                  </p>
                  <p className="text-xs text-[#6b6b80]">A mock interview will probe exactly these gaps and show you how to close them.</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={startingInterview || !job.resume_id}
                  className="shrink-0 rounded-lg bg-[#7c5cfc] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(124,92,252,0.2)] transition hover:bg-[#6341e0] disabled:opacity-50"
                >
                  {startingInterview ? "Starting..." : "Practice Now →"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Main Column */}
          <div className="flex flex-col gap-4">

            {/* Weak Spots — shown first, expanded by default */}
            {job.fit_weak_spots && job.fit_weak_spots.length > 0 && (
              <CollapsibleCard
                title="Weak Spots"
                icon="△"
                color="amber"
                count={`${job.fit_weak_spots.length} gaps`}
                defaultOpen={true}
              >
                <div className="flex flex-col">
                  {job.fit_weak_spots.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 last:border-0"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
                        <span className="text-[10px]">!</span>
                      </div>
                      <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Areas Likely to Be Probed — expanded by default */}
            {job.fit_areas_to_probe && job.fit_areas_to_probe.length > 0 && (
              <CollapsibleCard
                title="Areas Likely to Be Probed"
                icon="?"
                color="blue"
                count={`${job.fit_areas_to_probe.length} areas`}
                defaultOpen={true}
              >
                <div className="flex flex-col">
                  {job.fit_areas_to_probe.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 last:border-0"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                        <span className="text-[10px]">?</span>
                      </div>
                      <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Strong Alignment — collapsed by default */}
            {job.fit_strong_alignment && job.fit_strong_alignment.length > 0 && (
              <CollapsibleCard
                title="Strong Alignment"
                icon="✓"
                color="green"
                count={`${job.fit_strong_alignment.length} matches`}
                defaultOpen={false}
              >
                <div className="flex flex-col">
                  {job.fit_strong_alignment.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 last:border-0"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
                        <span className="text-[10px]">✓</span>
                      </div>
                      <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Questions */}
            {job.questions_status === "ready" && job.questions && job.questions.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-purple-600">✦</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">
                      Tailored Interview Questions
                    </h3>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {job.questions.length} questions
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {(job.questions as string[])
                    .slice(0, showAllQuestions ? undefined : 3)
                    .map((q, i) => (
                      <div key={i} className="flex gap-3.5 px-5 py-3.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xs font-bold text-purple-600">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-gray-700">{q}</p>
                      </div>
                    ))}
                </div>

                {/* Before first interview: gate remaining questions behind an interview CTA */}
                {job.questions.length > 3 && interviews.length === 0 && (
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    disabled={startingInterview || !job.resume_id}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 bg-[rgba(124,92,252,0.04)] py-3 text-sm font-semibold text-[#7c5cfc] transition-colors hover:bg-[rgba(124,92,252,0.08)] disabled:opacity-50"
                  >
                    + {job.questions.length - 3} more personalized questions — practice answering them with AI feedback →
                  </button>
                )}

                {/* After first interview: normal show more / fewer toggle */}
                {job.questions.length > 3 && interviews.length > 0 && !showAllQuestions && (
                  <button
                    type="button"
                    onClick={() => setShowAllQuestions(true)}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 bg-purple-50 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100"
                  >
                    Show {job.questions.length - 3} more questions ↓
                  </button>
                )}

                {showAllQuestions && job.questions.length > 3 && interviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllQuestions(false)}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 bg-purple-50 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100"
                  >
                    Show fewer questions ↑
                  </button>
                )}
              </div>
            )}

            {job.questions_status === "pending" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-purple-600" />
                  <span className="text-sm text-slate-500">Generating tailored questions...</span>
                </div>
              </div>
            )}

            {job.questions_status === "failed" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Unable to generate questions.{" "}
                  {job.questions_error && (
                    <span className="text-slate-400">({job.questions_error})</span>
                  )}
                </p>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${reanalyzing ? "animate-spin" : ""}`} />
                  {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
                </button>
              </div>
            )}

            {/* Preview teaser — shown before first interview when fit score is ready */}
            {interviews.length === 0 && job.fit_score_status === "ready" && (
              <PreviewResultsTeaser
                onStartInterview={handleStartInterview}
                isStarting={startingInterview}
                disabled={!job.resume_id}
              />
            )}

            {/* Post-Interview Results */}
            {interviews.length > 0 && (() => {
              const activeInterview = interviews.find(
                (i) => i.attempt_number === activeAttemptNumber
              );

              if (!activeInterview) return null;

              const hasMultipleAttempts = interviews.length >= 3;
              const firstInterview = interviews[interviews.length - 1];
              const bestInterview = interviews.reduce((best, curr) =>
                (curr.performance_overall_score ?? 0) > (best.performance_overall_score ?? 0)
                  ? curr
                  : best
              );
              const totalImprovement =
                (bestInterview.performance_overall_score ?? 0) -
                (firstInterview.performance_overall_score ?? 0);

              return (
                <>
                  {/* Compare Banner - only for 3+ attempts */}
                  {hasMultipleAttempts && (
                    <CompareBanner
                      totalImprovement={totalImprovement / 10}
                      bestScore={(bestInterview.performance_overall_score ?? 0) / 10}
                      attemptCount={interviews.length}
                    />
                  )}

                  {/* Interview Results Hero */}
                  {activeInterview.performance_status === "ready" &&
                    activeInterview.performance_overall_score !== null && (
                      <div className="relative">
                        <div className="absolute right-0 top-0 z-10 p-4">
                          <ShareInterviewButton
                            interviewId={activeInterview.id}
                            initialIsShared={activeInterview.is_shared ?? false}
                            initialShareToken={activeInterview.share_token ?? null}
                          />
                        </div>
                        <InterviewResultsHero
                          attemptNumber={activeInterview.attempt_number}
                          overallScore={activeInterview.performance_overall_score / 10}
                          title={
                            activeInterview.performance_overall_score >= 80
                              ? "Excellent Performance"
                              : activeInterview.performance_overall_score >= 70
                                ? "Good Progress"
                                : activeInterview.performance_overall_score >= 60
                                  ? "Solid Foundation"
                                  : "Room for Growth"
                          }
                          summary={generatePerformanceSummary(activeInterview, interviews)}
                          breakdown={[
                            {
                              label: "Question understanding",
                              score: (activeInterview.question_understanding_score ?? 0) / 10,
                            },
                            {
                              label: "Answer correctness",
                              score: (activeInterview.answer_correctness_score ?? 0) / 10,
                            },
                            {
                              label: "Reasoning quality",
                              score: (activeInterview.reasoning_quality_score ?? 0) / 10,
                            },
                            {
                              label: "Communication clarity",
                              score: (activeInterview.communication_clarity_score ?? 0) / 10,
                            },
                          ]}
                          isBestScore={
                            activeInterview.id === bestInterview.id && hasMultipleAttempts
                          }
                        />
                      </div>
                    )}

                  {/* Detailed Performance Breakdown - All Metrics */}
                  {activeInterview.performance_status === "ready" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Detailed Performance Breakdown
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
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
                        ].map((metric) => {
                          const value = activeInterview[metric.key as keyof InterviewSession] as number | null;
                          return (
                            <div
                              key={metric.key}
                              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                            >
                              <span className="text-xs text-gray-600">{metric.label}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {value !== null ? `${(value / 10).toFixed(1)}` : "--"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Performance Strengths, Growth Areas, Next Steps */}
                      {activeInterview.performance_strengths && activeInterview.performance_strengths.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Strengths
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {activeInterview.performance_strengths.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeInterview.performance_growth_areas && activeInterview.performance_growth_areas.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Growth Areas
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {activeInterview.performance_growth_areas.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeInterview.performance_next_steps && activeInterview.performance_next_steps.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Next Steps
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {activeInterview.performance_next_steps.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {activeInterview.recommendations &&
                    activeInterview.recommendations.length > 0 && (
                      <Recommendations
                        recommendations={activeInterview.recommendations}
                        defaultOpen={true}
                      />
                    )}

                  {/* Transcript */}
                  {activeInterview.transcript && activeInterview.transcript.length > 0 && (
                    <InterviewTranscript
                      exchanges={activeInterview.transcript}
                      defaultOpen={false}
                    />
                  )}

                  {/* Compare Table - only for 3+ attempts */}
                  {hasMultipleAttempts && (
                    <CompareAttemptsTable
                      attempts={interviews.map((interview) => ({
                        attemptNumber: interview.attempt_number,
                        overallScore: (interview.performance_overall_score ?? 0) / 10,
                        breakdown: {
                          questionUnderstanding: (interview.question_understanding_score ?? 0) / 10,
                          answerCorrectness: (interview.answer_correctness_score ?? 0) / 10,
                          reasoningQuality: (interview.reasoning_quality_score ?? 0) / 10,
                          followupDepth: (interview.followup_depth_score ?? 0) / 10,
                          communicationClarity: (interview.communication_clarity_score ?? 0) / 10,
                          behavioralStoryQuality: (interview.behavioral_story_quality_score ?? 0) / 10,
                          roleAlignmentCoverage: (interview.role_alignment_coverage_score ?? 0) / 10,
                          confidenceCalibration: (interview.confidence_calibration_score ?? 0) / 10,
                          timeManagement: (interview.time_management_score ?? 0) / 10,
                          recoveryAbility: (interview.recovery_ability_score ?? 0) / 10,
                        },
                      }))}
                      metrics={[
                        { key: "questionUnderstanding", label: "Question understanding" },
                        { key: "answerCorrectness", label: "Answer correctness" },
                        { key: "reasoningQuality", label: "Reasoning quality" },
                        { key: "followupDepth", label: "Depth under follow-ups" },
                        { key: "communicationClarity", label: "Communication clarity" },
                        { key: "behavioralStoryQuality", label: "Behavioral story quality" },
                        { key: "roleAlignmentCoverage", label: "Role alignment coverage" },
                        { key: "confidenceCalibration", label: "Confidence calibration" },
                        { key: "timeManagement", label: "Time management" },
                        { key: "recoveryAbility", label: "Recovery ability" },
                      ]}
                      defaultOpen={true}
                    />
                  )}
                </>
              );
            })()}

            {/* Credit confirmation dialog */}
            {/* {showCreditConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                  <h3 className="text-lg font-semibold text-slate-900">Start interview?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    This will use 1 interview credit. You have{" "}
                    <span className="font-semibold">{creditBalance}</span> credit
                    {creditBalance !== 1 ? "s" : ""} remaining.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmStartInterview}
                      disabled={startingInterview}
                      className="flex-1 rounded-lg bg-mm-violet px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-50"
                    >
                      {startingInterview ? "Starting..." : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreditConfirm(false)}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {/* Paywall modal — no credits */}
            {showInterviewPaywall && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                  <h3 className="text-lg font-semibold text-slate-900">
                    You&apos;re out of interview credits
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {interviewPaywallMessage ??
                      "Purchase credits to continue with this interview."}
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    {/* Subscriber: buy addon credits */}
                    {paywallHasSubscription && paywallCanBuyCredits && paywallCreditPriceCents ? (
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          Buy extra interviews
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ${(paywallCreditPriceCents / 100).toFixed(0)} per interview credit
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAddonBuyQuantity(Math.max(1, addonBuyQuantity - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-lg font-bold text-slate-900">
                            {addonBuyQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAddonBuyQuantity(addonBuyQuantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={paywallCheckingOut !== null}
                          onClick={() => handleBuyAddonCredits(addonBuyQuantity)}
                          className="mt-4 w-full rounded-xl bg-[#7c5cfc] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b4ee0] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {paywallCheckingOut === "addon"
                            ? "Redirecting..."
                            : `Buy ${addonBuyQuantity} credit${addonBuyQuantity !== 1 ? "s" : ""} · $${((paywallCreditPriceCents * addonBuyQuantity) / 100).toFixed(0)}`}
                        </button>
                      </div>
                    ) : !paywallHasSubscription ? (
                      /* Non-subscriber: direct to pricing */
                      <div className="rounded-xl border border-slate-200 p-5 text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          Subscribe to get interviews
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Plans start at $20/month with 10 interviews included.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowInterviewPaywall(false);
                            router.push("/pricing");
                          }}
                          className="mt-4 w-full rounded-xl bg-[#7c5cfc] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b4ee0]"
                        >
                          View plans
                        </button>
                      </div>
                    ) : (
                      /* Subscriber but can't buy credits (edge case) */
                      <div className="rounded-xl border border-slate-200 p-5 text-center">
                        <p className="text-sm text-slate-600">
                          Your monthly sessions are used up. They&apos;ll reset at the start of your next billing cycle.
                        </p>
                      </div>
                    )}
                  </div>

                  {paywallPurchaseMessage && (
                    <p className="mt-3 text-xs text-rose-600">{paywallPurchaseMessage}</p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInterviewPaywall(false);
                        router.push("/settings/billing");
                      }}
                      className="text-xs font-medium text-mm-violet hover:underline"
                    >
                      Open billing page
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInterviewPaywall(false);
                        setPaywallPurchaseMessage(null);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
          {/* End Main Column */}

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Show RetryCTACard if user has completed interviews, otherwise show InterviewCTACard */}
            {interviews.length > 0 && interviews[0]?.performance_overall_score !== null ? (
              <RetryCTACard
                onRetryInterview={handleStartInterview}
                currentScore={interviews[0].performance_overall_score / 10}
                hasCredits={creditBalance !== null && creditBalance > 0}
                creditCount={creditBalance ?? 0}
                disabled={!job.resume_id}
                isStarting={startingInterview}
              />
            ) : (
              <InterviewCTACard
                onStartInterview={handleStartInterview}
                hasCredits={creditBalance !== null && creditBalance > 0}
                creditCount={creditBalance ?? 0}
                disabled={!job.resume_id}
                isStarting={startingInterview}
                fitScore={job.fit_score}
                weakSpots={job.fit_weak_spots}
              />
            )}

            {/* Show InterviewHistoryCard if user has interviews */}
            {interviews.length > 0 && activeAttemptNumber !== null && (
              <InterviewHistoryCard
                attempts={interviews.map((interview) => ({
                  attemptNumber: interview.attempt_number,
                  score: (interview.performance_overall_score ?? 0) / 10,
                  date: new Date(interview.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  durationMinutes: Math.round((interview.duration_seconds ?? 0) / 60),
                  isBest:
                    interview.performance_overall_score ===
                    Math.max(...interviews.map((i) => i.performance_overall_score ?? 0)),
                }))}
                activeAttemptNumber={activeAttemptNumber}
                onSelectAttempt={(attemptNumber) => setActiveAttemptNumber(attemptNumber)}
              />
            )}

            <CreditsCard
              creditCount={creditBalance ?? 0}
              onBuyClick={() => router.push("/settings/billing")}
              purchasing={paywallCheckingOut !== null}
            />
          </div>
          {/* End Sidebar */}
        </div>
        {/* End Two-column grid */}
      </div>
      {/* End page body */}

      {/* Sticky Bottom Bar - shows on scroll */}
      <StickyBottomBar
        onStartInterview={handleStartInterview}
        disabled={!job.resume_id}
        isStarting={startingInterview}
        visible={showStickyBar}
        icon="🎙️"
        text={
          interviews.length === 0
            ? (() => {
              if (job.interview_date) {
                const d = Math.ceil((new Date(job.interview_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (d >= 0 && d <= 14) return `${d} day${d !== 1 ? "s" : ""} until your interview`;
              }
              return "Close your gaps before interview day";
            })()
            : interviews.length === 1
              ? `Score: ${((interviews[0].performance_overall_score ?? 0) / 10).toFixed(1)}/10 —`
              : `Best: ${(Math.max(...interviews.map((i) => i.performance_overall_score ?? 0)) / 10).toFixed(1)}/10 —`
        }
        subtext={
          interviews.length === 0
            ? creditBalance && creditBalance > 0
              ? `${creditBalance} credit${creditBalance !== 1 ? "s" : ""} available`
              : "· From $5"
            : interviews.length === 1
              ? "Retry to improve"
              : "Keep improving"
        }
        buttonLabel={
          interviews.length === 0
            ? "Practice Now →"
            : interviews.length === 1
              ? "Retry Interview"
              : `Start Interview #${interviews.length + 1}`
        }
      />
    </div>
  );
}
