"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { DashboardRoot } from "@/components/dashboard/DashboardRoot";
import { HeaderGreeting } from "@/components/dashboard/HeaderGreeting";
import { StateNoResume } from "@/components/dashboard/redesign/StateNoResume";
import { StateContextGathering } from "@/components/dashboard/redesign/StateContextGathering";
import { StateAssessmentReady } from "@/components/dashboard/redesign/StateAssessmentReady";

type DashboardState =
  | "NO_RESUME"
  | "CONTEXT_GATHERING"
  | "GENERATING"
  | "ASSESSMENT_READY";

export default function Page() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  // Auth & User Data
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firstName, setFirstName] = useState("there");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Resume Upload State
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<
    "idle" | "analyzing" | "ready" | "failed"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);

  // Job Description State
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<DashboardState>("NO_RESUME");

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived State Logic
  useEffect(() => {
    if (!resumeUploaded) {
      setCurrentView("NO_RESUME");
    } else if (currentView === "GENERATING") {
      // Don't override the generating state
    } else if (currentView !== "ASSESSMENT_READY") {
      setCurrentView("CONTEXT_GATHERING");
    }
  }, [resumeUploaded]);

  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const pollFileStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        pollTimeoutRef.current = setTimeout(() => pollFileStatus(id), 4000);
        return;
      }

      const status = data.extractedTextStatus as string;
      if (status === "done") {
        setAnalysisStatus("ready");
        setUploadError(null);
        return;
      }
      if (status === "failed") {
        setAnalysisStatus("failed");
        setUploadError(data.extractedTextError ?? "Analysis failed.");
        return;
      }

      setAnalysisStatus("analyzing");
      pollTimeoutRef.current = setTimeout(() => pollFileStatus(id), 3000);
    } catch {
      pollTimeoutRef.current = setTimeout(() => pollFileStatus(id), 5000);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      const fallbackName = data.user.email?.split("@")[0] ?? "there";
      const metaFirstName = data.user.user_metadata?.first_name as
        | string
        | undefined;
      setFirstName(metaFirstName ?? fallbackName);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        if (fullName) {
          setFirstName(fullName);
        } else if (profile.first_name) {
          setFirstName(profile.first_name);
        }
      }
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }

      setCheckingAuth(false);
    };

    checkSession();
    return () => {
      stopPolling();
    };
  }, [router, supabase]);

  const handlePickResume = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    setUploadError(null);
    setResumeFilename(file.name);
    setAnalysisStatus("analyzing");

    try {
      stopPolling();
      const presignResponse = await fetch("/api/files/resume/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      const presignData = await presignResponse.json().catch(() => ({}));
      if (!presignResponse.ok || !presignData.ok) {
        throw new Error(presignData?.error ?? "Unable to start upload.");
      }

      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed.");
      }

      const completeResponse = await fetch("/api/files/resume/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey: presignData.storageKey,
          bucket: presignData.bucket,
          contentType: file.type,
          sizeBytes: file.size,
          originalFilename: file.name,
        }),
      });

      const completeData = await completeResponse.json().catch(() => ({}));
      if (!completeResponse.ok || !completeData.ok) {
        throw new Error(completeData?.error ?? "Unable to complete upload.");
      }
      if (!completeData.fileId) {
        throw new Error("Upload completed without a file id.");
      }

      setResumeUploaded(true);
      setAnalysisStatus("analyzing");
      pollFileStatus(completeData.fileId);
    } catch (error) {
      setResumeUploaded(false);
      setAnalysisStatus("failed");
      setUploadError(
        error instanceof Error ? error.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  };

  // Transition to generating state, then reveal insights
  const transitionToInsights = useCallback(
    (jd: string | null) => {
      setJobDescription(jd);
      setCurrentView("GENERATING");
      setTimeout(() => {
        setCurrentView("ASSESSMENT_READY");
      }, 2000);
    },
    []
  );

  const handleAnalyzeJob = (jd: string) => {
    transitionToInsights(jd);
  };

  const handleSkipJob = () => {
    transitionToInsights(null);
  };

  const handleStartEvaluation = () => {
    console.log("Starting evaluation for:", jobDescription);
    alert("Starting Mock Interview Sequence...");
  };

  const handleUpdateResume = () => {
    setResumeUploaded(false);
    setJobDescription(null);
    setResumeFilename(null);
    setCurrentView("NO_RESUME");
  };

  const handleUpdateJob = () => {
    setCurrentView("CONTEXT_GATHERING");
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <DashboardRoot>
      <HeaderGreeting
        firstName={firstName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="transition-all duration-300 ease-in-out">
        {currentView === "NO_RESUME" && (
          <StateNoResume
            isUploading={uploading}
            onPickFile={handlePickResume}
            error={uploadError}
          />
        )}

        {currentView === "CONTEXT_GATHERING" && (
          <StateContextGathering
            resumeFilename={resumeFilename ?? "resume.pdf"}
            onAnalyze={handleAnalyzeJob}
            onSkip={handleSkipJob}
          />
        )}

        {currentView === "GENERATING" && (
          <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center">
            <div className="mb-6 h-10 w-10 rounded-full border-2 border-mm-violet/30 border-t-mm-violet animate-spin" />
            <p className="text-lg font-medium text-mm-text">
              Analyzing your background
            </p>
            <p className="mt-2 text-sm text-mm-dim">
              Generating interview questions from your resume...
            </p>
          </div>
        )}

        {currentView === "ASSESSMENT_READY" && (
          <StateAssessmentReady
            onStartEvaluation={handleStartEvaluation}
            onUpdateResume={handleUpdateResume}
            onUpdateJob={handleUpdateJob}
            hasJobDescription={!!jobDescription}
            greeting={`Welcome back, ${firstName}`}
          />
        )}
      </main>
    </DashboardRoot>
  );
}
