import { ResumeEvidenceCard } from "@/components/dashboard/ResumeEvidenceCard";

const snapshotFields = [
  {
    label: "Target role",
    value: "Senior Full-Stack Engineer",
  },
  {
    label: "Experience signal",
    value: "Hands-on ownership with system-level responsibility",
  },
  {
    label: "Interview style expected",
    value: "Depth-first questioning with follow-ups",
  },
  {
    label: "Strength signal",
    value: "Architecture and execution clarity",
  },
  {
    label: "Likely challenge",
    value: "Quantifying impact beyond implementation",
  },
  {
    label: "Follow-up intensity",
    value: "High",
  },
];

type ReadinessSnapshotProps = {
  hasResume: boolean;
  filename?: string | null;
  isUploading: boolean;
  analysisStatus: "idle" | "analyzing" | "ready" | "failed";
  error?: string | null;
  onPickFile: (file: File) => void;
  onUploadAnother: () => void;
};

export function ReadinessSnapshot({
  hasResume,
  filename,
  isUploading,
  analysisStatus,
  error,
  onPickFile,
  onUploadAnother,
}: ReadinessSnapshotProps) {
  let statusLabel = "Not attached";
  if (isUploading) statusLabel = "Uploading";
  else if (analysisStatus === "analyzing") statusLabel = "Analyzing";
  else if (analysisStatus === "ready") statusLabel = "Ready";
  else if (analysisStatus === "failed") statusLabel = "Analysis failed";
  else if (hasResume) statusLabel = "Attached";

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Interview Readiness Snapshot</h2>
        <p className="text-sm text-slate-400">Based on your resume and role expectations</p>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="uppercase tracking-wide">Resume status</span>
          <span className="text-slate-200">{statusLabel}</span>
        </div>
        <div className="mt-4 space-y-3">
          {snapshotFields.map((field) => (
            <div key={field.label} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-400">{field.label}</span>
              <span className="text-slate-200">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

  <ResumeEvidenceCard
        hasResume={hasResume}
        filename={filename}
        isUploading={isUploading}
        error={error}
        onPickFile={onPickFile}
        onUploadAnother={onUploadAnother}
      />
    </section>
  );
}
