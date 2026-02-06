"use client";

import { useRef, useState, useCallback } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

type StateNoResumeProps = {
  isUploading: boolean;
  onPickFile: (file: File) => void;
  error?: string | null;
};

export function StateNoResume({
  isUploading,
  onPickFile,
  error,
}: StateNoResumeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPickFile(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onPickFile(file);
      }
    },
    [onPickFile]
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-lg flex-col items-center justify-center px-6">
      {/* Small label */}
      <div className="mb-6 inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5">
        <span className="text-xs font-medium tracking-wide text-mm-muted">
          Step 1 of 2
        </span>
      </div>

      <h1 className="mb-3 text-center text-[32px] font-semibold leading-tight tracking-tight text-mm-text">
        Upload your resume
      </h1>

      <p className="mb-10 max-w-md text-center text-[15px] leading-relaxed text-mm-muted">
        We analyze your background to generate interview questions
        specific to your experience. This takes about 10 seconds.
      </p>

      {error && (
        <div className="mb-6 w-full max-w-sm rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Upload zone */}
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        className={`group relative flex w-full max-w-sm flex-col items-center justify-center rounded-2xl px-8 py-14 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "glass-card-elevated gradient-border"
            : "glass-card hover:border-[rgba(255,255,255,0.12)]"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-mm-violet border-t-transparent animate-spin" />
            <span className="text-sm text-mm-muted">Analyzing resume...</span>
          </div>
        ) : (
          <>
            {/* Icon with glow */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mm-violet/20 to-mm-blue/20 ring-1 ring-mm-violet/20">
              <ArrowUpTrayIcon className="h-6 w-6 text-mm-violet" />
            </div>

            <span className="text-base font-medium text-mm-text">
              Drop your resume here
            </span>
            <span className="mt-1 text-sm text-mm-dim">
              or click to browse
            </span>

            <div className="mt-6 inline-flex items-center rounded-lg bg-gradient-cta px-5 py-2.5 text-sm font-medium text-white transition-all glow-accent group-hover:glow-accent-hover">
              Select file
            </div>
          </>
        )}
      </button>

      <p className="mt-6 text-center text-xs text-mm-dim">
        PDF or DOCX accepted. Your file is processed securely and never shared.
      </p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
    </div>
  );
}
