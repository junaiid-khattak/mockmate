"use client";

import { useState } from "react";

interface Recommendation {
  type: "improve" | "strength" | "refine";
  text: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
  defaultOpen?: boolean;
}

export function Recommendations({
  recommendations,
  defaultOpen = true,
}: RecommendationsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const typeColors = {
    improve: "bg-amber-100 text-amber-600",
    strength: "bg-green-100 text-green-600",
    refine: "bg-purple-100 text-purple-600",
  };

  const typeLabels = {
    improve: "Improve",
    strength: "Strength",
    refine: "Refine",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-amber-600">⚡</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Recommendations
          </h3>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {recommendations.length} {recommendations.length === 1 ? "item" : "items"}
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
          {recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 px-5 py-3.5">
              <span
                className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColors[rec.type]}`}
              >
                {typeLabels[rec.type]}
              </span>
              <span className="text-sm leading-relaxed text-gray-700">{rec.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
