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
  created_at: string;
  updated_at: string;
};

const PLACEHOLDER_STRENGTHS = [
  "Strong alignment with required technical skills",
  "Demonstrated ownership and delivery in similar scope",
  "Communication style matches company culture signals",
];

const PLACEHOLDER_PROBES = [
  "Quantifying impact beyond implementation details",
  "Handling ambiguity in cross-functional settings",
  "Scaling decisions under production constraints",
];

const PLACEHOLDER_QUESTIONS = [
  "Walk me through a system you designed end-to-end. What were the key trade-offs?",
  "Tell me about a time you had to push back on a product requirement. How did you approach it?",
  "Describe a situation where you had to debug a production issue under time pressure.",
  "How do you decide what to build versus what to buy or delegate?",
  "Give me an example of mentoring someone on your team. What was the outcome?",
];

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

      // Fetch job
      const jobRes = await fetch(`/api/job-descriptions/${jobId}`);
      const jobBody = await jobRes.json().catch(() => ({}));
      if (!jobRes.ok || !jobBody?.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const jd = jobBody.job_description as Job;
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
    };
    init();
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
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Fit Score
            </h2>
            <span className="text-xs text-gray-400">Placeholder</span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-mm-violet">7</span>
            <span className="text-lg text-gray-400">/ 10</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Based on resume-to-job alignment. This score will be generated by
            analysis once available.
          </p>
        </section>

        {/* Strong Alignment */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Strong Alignment
          </h2>
          <ul className="mt-4 space-y-3">
            {PLACEHOLDER_STRENGTHS.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-emerald-500">
                  <path d="M13.3 4L6 11.3L2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Areas Likely to Be Probed */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Areas Likely to Be Probed
          </h2>
          <ul className="mt-4 space-y-3">
            {PLACEHOLDER_PROBES.map((item, i) => (
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

        {/* Likely Interview Questions */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Likely Interview Questions
          </h2>
          <ol className="mt-4 space-y-4">
            {PLACEHOLDER_QUESTIONS.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-gray-700">{q}</p>
              </li>
            ))}
          </ol>
        </section>

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
