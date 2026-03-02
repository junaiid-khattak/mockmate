"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";
import { Sparkles, CheckCircle } from "lucide-react";

type Resume = { id: string; original_filename: string | null; created_at: string };
type ExtractionState = "idle" | "checking" | "processing" | "success" | "failed";

const MIN_CONTENT = 50;
const POLL_INTERVAL_MS = 2500;

export default function NewJobPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");

  // Wizard step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Resume
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractionState, setExtractionState] = useState<ExtractionState>("idle");
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Step 2: Job details
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  // Step 3: Creating
  const [createError, setCreateError] = useState<string | null>(null);

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
    };
    init();
  }, [router, supabase]);

  // Fetch resumes on mount
  useEffect(() => {
    const load = async () => {
      setLoadingResumes(true);
      const res = await fetch("/api/resumes");
      const body = await res.json().catch(() => ({}));
      if (body?.ok) {
        setResumes(body.resumes ?? []);
      }
      setLoadingResumes(false);
    };
    load();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  // Poll extraction status for a given resume ID
  const pollExtraction = useCallback(async (resumeId: string) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    try {
      const res = await fetch(`/api/files/${resumeId}`);
      const body = await res.json().catch(() => ({}));

      if (!body?.ok) {
        // Can't read status — keep polling
        pollTimerRef.current = setTimeout(() => pollExtraction(resumeId), POLL_INTERVAL_MS);
        return;
      }

      const status = body.extractedTextStatus as string | null;
      if (status === "successful") {
        setExtractionState("success");
        setExtractionError(null);
      } else if (status === "failed") {
        setExtractionState("failed");
        setExtractionError(
          body.extractedTextError ?? "Could not read this resume. Try a different PDF or DOCX file.",
        );
      } else {
        // Still pending — keep polling
        pollTimerRef.current = setTimeout(() => pollExtraction(resumeId), POLL_INTERVAL_MS);
      }
    } catch {
      // Network error — keep polling
      pollTimerRef.current = setTimeout(() => pollExtraction(resumeId), POLL_INTERVAL_MS);
    }
  }, []); // state setters are stable; no external deps needed

  // Select an existing resume: clear previous poll and start checking
  const selectResume = useCallback(
    (id: string) => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      setSelectedResumeId(id);
      setExtractionState("checking");
      setExtractionError(null);
      setUploadError(null);
      pollExtraction(id);
    },
    [pollExtraction],
  );

  // Upload a new resume file
  const handleUpload = async (file: File) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setIsUploading(true);
    setUploadError(null);
    setExtractionState("idle");
    setExtractionError(null);

    try {
      const presignRes = await fetch("/api/files/resume/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size }),
      });
      const presign = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok || !presign?.ok) throw new Error(presign?.error ?? "Unable to start upload.");

      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed.");

      const completeRes = await fetch("/api/files/resume/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey: presign.storageKey,
          bucket: presign.bucket,
          contentType: file.type,
          sizeBytes: file.size,
          originalFilename: file.name,
        }),
      });
      const complete = await completeRes.json().catch(() => ({}));
      if (!completeRes.ok || !complete?.ok) throw new Error(complete?.error ?? "Unable to complete upload.");

      const newResume: Resume = {
        id: complete.resumeId,
        original_filename: file.name,
        created_at: new Date().toISOString(),
      };
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResumeId(complete.resumeId);
      setExtractionState("processing");
      pollExtraction(complete.resumeId);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setExtractionState("idle");
    } finally {
      setIsUploading(false);
    }
  };

  // Create job and redirect
  const handleCreate = async () => {
    setStep(3);
    setCreateError(null);

    const minDelay = new Promise((r) => setTimeout(r, 800));

    try {
      const [res] = await Promise.all([
        fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            company: company.trim() || undefined,
            content: content.trim(),
            source_url: sourceUrl.trim() || undefined,
            resume_id: selectedResumeId,
            interview_date: interviewDate.trim() || undefined,
          }),
        }),
        minDelay,
      ]);

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? "Unable to create job.");

      router.replace(`/jobs/${body.job.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong.");
      setStep(2);
    }
  };

  const isProcessing = extractionState === "checking" || extractionState === "processing";
  const canContinueFromStep1 = extractionState === "success" && !isUploading;
  const step2Valid = title.trim().length > 0 && content.trim().length >= MIN_CONTENT;

  if (checkingAuth) return null;

  return (
    <div className="text-slate-900">
      <Header firstName={firstName} onLogout={handleLogout} backHref="/jobs" backLabel="Jobs" />

      <div className="mx-auto max-w-xl px-6 py-10">
        {/* ── Progress indicator ── */}
        {step < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className={step >= 1 ? "text-mm-violet font-semibold" : ""}>
                Step 1 of 2: Upload Resume
              </span>
              <span className={step >= 2 ? "text-mm-violet font-semibold" : ""}>
                Step 2 of 2: Job Details
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mm-violet to-mm-blue transition-all duration-500 ease-out"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Resume ── */}
        {step === 1 && (
          <div>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              {isProcessing ? "Reading your resume..." : "Select your resume"}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              {isProcessing
                ? "Extracting your experience and background."
                : "Your resume is the starting point. We\u2019ll analyze it against the job to find your blind spots."}
            </p>

            {/* Processing animation */}
            {isProcessing && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-2 border-slate-100 border-t-mm-violet" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-mm-violet" />
                  </div>
                </div>
                <p className="text-sm text-slate-500">Crunching your resume with AI&hellip;</p>
              </div>
            )}

            {/* Success banner */}
            {extractionState === "success" && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                <p className="text-sm font-medium text-green-800">Resume uploaded. Let&apos;s see how you match up →</p>
              </div>
            )}

            {/* Error banner */}
            {extractionState === "failed" && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">We couldn&apos;t read this resume.</p>
                <p className="mt-1 text-sm text-red-700">
                  {extractionError ??
                    "The file may be corrupted or unsupported. Try a different PDF or DOCX file."}
                </p>
              </div>
            )}

            {/* Resume list — hidden while actively processing */}
            {!isProcessing && (
              <div className="mt-8 space-y-3">
                {loadingResumes ? (
                  <div className="flex justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-mm-violet" />
                  </div>
                ) : (
                  <>
                    {resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                          selectedResumeId === r.id
                            ? "border-mm-violet bg-violet-50/50 ring-1 ring-mm-violet/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resume"
                          checked={selectedResumeId === r.id}
                          onChange={() => selectResume(r.id)}
                          className="sr-only"
                        />
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selectedResumeId === r.id
                              ? "border-mm-violet bg-mm-violet"
                              : "border-slate-300"
                          }`}
                        >
                          {selectedResumeId === r.id && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path
                                d="M8 3L4 7L2 5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {r.original_filename ?? "Resume"}
                          </p>
                          <p className="text-xs text-slate-400">
                            Uploaded{" "}
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </label>
                    ))}

                    {/* Upload new resume */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-left transition-all hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="flex h-5 w-5 items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-mm-violet" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center text-slate-400">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M8 3V13M3 8H13"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-600">
                        {isUploading ? "Uploading..." : "Upload new resume"}
                      </span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </>
                )}

                {uploadError && <p className="mt-3 text-sm text-red-500">{uploadError}</p>}
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!canContinueFromStep1}
              className="mt-8 w-full rounded-lg bg-mm-violet px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              See My Fit Score →
            </button>
          </div>
        )}

        {/* ── Step 2: Job details ── */}
        {step === 2 && (
          <div>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              Tell us about the role
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              We&apos;ll use this to tailor your preparation brief.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company <span className="text-xs text-slate-400">(recommended)</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="content"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {content.trim().length} / {MIN_CONTENT} characters minimum
                </p>
              </div>

              <div>
                <label htmlFor="sourceUrl" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job link <span className="text-xs text-slate-400">(optional)</span>
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>

              <div>
                <label htmlFor="interviewDate" className="mb-1.5 block text-sm font-medium text-slate-700">
                  When is your interview?
                </label>
                <input
                  id="interviewDate"
                  type="date"
                  value={interviewDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  We&apos;ll create a personalized practice timeline so you&apos;re ready by interview day.
                </p>
              </div>
            </div>

            {createError && <p className="mt-4 text-sm text-red-500">{createError}</p>}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!step2Valid}
                className="flex-1 rounded-lg bg-mm-violet px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze My Fit →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Generating brief ── */}
        {step === 3 && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 animate-spin rounded-full border-2 border-slate-100 border-t-mm-violet" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-mm-violet" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Building your interview brief</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Analyzing the job, scoring your resume fit, and generating tailored questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
