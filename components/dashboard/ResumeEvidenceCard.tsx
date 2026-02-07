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
  error?: string | null;
  onPickResume: (file: File) => void;
  onUploadAnother: () => void;
};

export function ResumeEvidenceCard({
  hasResume,
  filename,
  isUploading,
  error,
  onPickResume,
  onUploadAnother,
}: ResumeEvidenceCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChooseResume = () => {
    inputRef.current?.click();
  };

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onPickResume(file);
    event.target.value = "";
  };

  return (
    <Card className="border-slate-800/70 bg-slate-900/40">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-950/60 text-slate-400">
                {hasResume ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100">
                  {hasResume ? "Resume attached ✓" : "Attach resume"}
                </p>
                {hasResume ? (
                  <p className="text-xs text-slate-400">File: {filename ?? "Resume.pdf"}</p>
                ) : (
                  <p className="text-xs text-slate-400">PDF or DOCX • Multiple versions supported</p>
                )}
              </div>
            </div>
          </div>
          {!hasResume ? (
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-200 sm:w-auto"
              onClick={handleChooseResume}
              disabled={isUploading}
            >
              {isUploading ? <Spinner className="mr-2" size="sm" /> : null}
              Upload resume
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-200 sm:w-auto"
              onClick={() => {
                onUploadAnother();
                handleChooseResume();
              }}
              disabled={isUploading}
            >
              {isUploading ? <Spinner className="mr-2" size="sm" /> : null}
              Upload another version
            </Button>
          )}
        </div>

        {error ? <p className="text-xs text-amber-300">{error}</p> : null}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleResumeChange}
        />
      </CardContent>
    </Card>
  );
}
