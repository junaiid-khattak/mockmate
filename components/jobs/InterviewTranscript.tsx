"use client";

import { useState } from "react";

interface TranscriptExchange {
  speaker: "ai" | "user";
  message: string;
  timestamp?: string;
}

interface InterviewTranscriptProps {
  exchanges: TranscriptExchange[];
  defaultOpen?: boolean;
}

export function InterviewTranscript({
  exchanges,
  defaultOpen = false,
}: InterviewTranscriptProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-gray-500">💬</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Full Transcript
          </h3>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {exchanges.length} {exchanges.length === 1 ? "exchange" : "exchanges"}
          </span>
        </div>
        <span
          className={`text-xs text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="divide-y divide-gray-100">
          {exchanges.map((exchange, i) => (
            <div key={i} className="px-5 py-3.5">
              <div
                className={`mb-1 text-xs font-bold uppercase tracking-wide ${
                  exchange.speaker === "ai" ? "text-purple-600" : "text-blue-600"
                }`}
              >
                {exchange.speaker === "ai" ? "AI Interviewer" : "You"}
              </div>
              <div className="text-sm leading-relaxed text-gray-700">{exchange.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
