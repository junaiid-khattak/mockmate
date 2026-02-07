"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Header } from "@/components/jobs/Header";

type Resume = { id: string; original_filename: string | null; created_at: string };

const MIN_CONTENT = 50;

export default function NewJobPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");

  // Wizard step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Job details
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Step 2: Resume
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Fetch resumes when entering step 2
  useEffect(() => {
    if (step !== 2) return;
    const load = async () => {
      setLoadingResumes(true);
      const res = await fetch("/api/resumes");
      const body = await res.json().catch(() => ({}));
      if (body?.ok) {
        setResumes(body.resumes ?? []);
        if (!selectedResumeId && body.resumes?.length > 0) {
          setSelectedResumeId(body.resumes[0].id);
        }
      }
      setLoadingResumes(false);
    };
    load();
  }, [step]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  // Step 1 validation
  const step1Valid = title.trim().length > 0 && content.trim().length >= MIN_CONTENT;

  // Upload a new resume
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const presignRes = await fetch("/api/files/resume/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
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
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Create job and redirect
  const handleCreate = async () => {
    setStep(3);
    setCreateError(null);

    // Small delay so the interstitial feels intentional
    const minDelay = new Promise((r) => setTimeout(r, 2000));

    try {
      const [res] = await Promise.all([
        fetch("/api/job-descriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            company: company.trim() || undefined,
            content: content.trim(),
            source_url: sourceUrl.trim() || undefined,
            resume_id: selectedResumeId,
          }),
        }),
        minDelay,
      ]);

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? "Unable to create job.");

      router.replace(`/jobs/${body.job_description.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong.");
      setStep(2);
    }
  };

  if (checkingAuth) return null;

  return (
    <div className="text-gray-900">
      <Header
        firstName={firstName}
        onLogout={handleLogout}
        backHref="/jobs"
        backLabel="Jobs"
      />

      <div className="mx-auto max-w-xl px-6 py-10">
        {/* ── Step indicator ── */}
        {step < 3 && (
          <div className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
              Step {step} of 2
            </span>
          </div>
        )}

        {/* ── Step 1: Job details ── */}
        {step === 1 && (
          <div>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
              Tell us about the role
            </h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              We&apos;ll use this to tailor your preparation brief.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Job title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Company <span className="text-xs text-gray-400">(recommended)</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Job description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="content"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full resize-y rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {content.trim().length} / {MIN_CONTENT} characters minimum
                </p>
              </div>

              <div>
                <label htmlFor="sourceUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Job link <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-mm-violet focus:outline-none focus:ring-2 focus:ring-mm-violet/20"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="mt-8 w-full rounded-lg bg-mm-violet px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Resume attachment ── */}
        {step === 2 && (
          <div>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
              Attach your resume
            </h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              We&apos;ll compare your background against the job to build your brief.
            </p>

            <div className="mt-8">
              {loadingResumes ? (
                <div className="flex justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-mm-violet" />
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                        selectedResumeId === r.id
                          ? "border-mm-violet bg-violet-50/50 ring-1 ring-mm-violet/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resume"
                        checked={selectedResumeId === r.id}
                        onChange={() => setSelectedResumeId(r.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selectedResumeId === r.id ? "border-mm-violet bg-mm-violet" : "border-gray-300"
                        }`}
                      >
                        {selectedResumeId === r.id && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M8 3L4 7L2 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {r.original_filename ?? "Resume"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Uploaded {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </label>
                  ))}

                  {/* Upload new */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-300 p-4 text-left transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="flex h-5 w-5 items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-mm-violet" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-600">
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
                </div>
              )}

              {uploadError && (
                <p className="mt-3 text-sm text-red-500">{uploadError}</p>
              )}
              {createError && (
                <p className="mt-3 text-sm text-red-500">{createError}</p>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedResumeId || isUploading}
                className="flex-1 rounded-lg bg-mm-violet px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create job
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Generating brief ── */}
        {step === 3 && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="mb-6 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-mm-violet" />
            <h2 className="text-lg font-semibold text-gray-900">
              Preparing your brief
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              This will only take a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
