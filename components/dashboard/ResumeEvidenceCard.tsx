import { useRef } from "react";
import type { ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Upload } from "lucide-react";

type ResumeEvidenceCardProps = {
  hasResume: boolean;
  filename?: string | null;
  isUploading: boolean;
  analysisStatus?: "idle" | "analyzing" | "ready" | "failed";
  error?: string | null;
  onPickFile: (file: File) => void;
  onUploadAnother: () => void;
};

export function ResumeEvidenceCard({
  hasResume,
  filename,
  isUploading,
  analysisStatus = "idle",
  error,
  onPickFile,
  onUploadAnother,
}: ResumeEvidenceCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onPickFile(file);
    event.target.value = "";
  };

  const statusLabel =
    analysisStatus === "analyzing"
      ? "Analyzing…"
      : analysisStatus === "ready"
      ? "Ready"
      : analysisStatus === "failed"
      ? "Analysis failed"
      : null;

  return (
    <Card className="border-slate-800/80 bg-slate-900/70 shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950/60 text-slate-300">
            {hasResume ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              {hasResume ? "Resume attached ✓" : "Attach resume"}
            </h2>
            {hasResume ? (
              <p className="text-xs text-slate-400">File: {filename ?? "Resume.pdf"}</p>
            ) : null}
            {statusLabel ? <p className="text-xs text-slate-400">Status: {statusLabel}</p> : null}
            {!hasResume ? (
              <p className="text-xs text-slate-400">PDF or DOCX • Multiple versions supported</p>
            ) : null}
          </div>
        </div>

        {!hasResume ? (
          <Button className="w-full sm:w-auto" onClick={handleChooseFile} disabled={isUploading}>
            {isUploading ? <Spinner className="mr-2" size="sm" /> : null}
            Upload resume
          </Button>
        ) : (
          <>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Signals detected
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role focus</span>
                  <span className="text-slate-200">Full Stack / Backend</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Interview emphasis</span>
                  <span className="text-slate-200">Ownership, Depth, Tradeoffs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Risk</span>
                  <span className="text-amber-300">Impact metrics unclear</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-200 sm:w-auto"
              onClick={() => {
                onUploadAnother();
                handleChooseFile();
              }}
              disabled={isUploading}
            >
              {isUploading ? <Spinner className="mr-2" size="sm" /> : null}
              Upload another version
            </Button>
          </>
        )}

        {error ? <p className="text-xs text-amber-300">{error}</p> : null}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
