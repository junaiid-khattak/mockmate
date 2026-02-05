"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { DashboardRoot } from "@/components/dashboard/DashboardRoot";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EvaluationSetupPanel } from "@/components/dashboard/EvaluationSetupPanel";
import { ResumeEvidenceCard } from "@/components/dashboard/ResumeEvidenceCard";
import { BeginEvaluationCTA } from "@/components/dashboard/BeginEvaluationCTA";
import { FullEvaluationPreview } from "@/components/dashboard/FullEvaluationPreview";
import { AccessLevels } from "@/components/dashboard/AccessLevels";

export default function Page() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "ready" | "failed">(
    "idle"
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("there");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [introMessage, setIntroMessage] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const metaFirstName = data.user.user_metadata?.first_name as string | undefined;
      setFirstName(metaFirstName ?? fallbackName);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
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
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAnother = () => {
    stopPolling();
    setResumeUploaded(false);
    setResumeFilename(null);
    setAnalysisStatus("idle");
    setUploadError(null);
  };

  const handleStartIntroInterview = () => {
    setIntroMessage("Intro evaluation will start here.");
  };

  const handleSelectPlan = () => {
    setPlanMessage("Checkout next.");
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

  if (checkingAuth) {
    return null;
  }

  return (
    <DashboardRoot>
      <DashboardHeader
        firstName={firstName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <EvaluationSetupPanel />
      <ResumeEvidenceCard
        hasResume={resumeUploaded}
        filename={resumeFilename}
        isUploading={uploading}
        analysisStatus={analysisStatus}
        error={uploadError}
        onPickFile={handlePickResume}
        onUploadAnother={handleUploadAnother}
      />
      <div className="space-y-2">
        <BeginEvaluationCTA enabled={resumeUploaded} onStart={handleStartIntroInterview} />
        {introMessage ? (
          <p className="text-center text-xs text-slate-300">{introMessage}</p>
        ) : null}
      </div>
      <FullEvaluationPreview />
      <div className="space-y-2">
        <AccessLevels onSelect={handleSelectPlan} />
        {planMessage ? (
          <p className="text-center text-xs text-slate-400">{planMessage}</p>
        ) : null}
      </div>
    </DashboardRoot>
  );
}
