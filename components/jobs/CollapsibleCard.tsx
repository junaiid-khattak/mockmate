"use client";

import { useState } from "react";

type CollapsibleCardColor = "green" | "amber" | "purple" | "gray";

interface CollapsibleCardProps {
  title: string;
  count?: string;
  icon?: string;
  color?: CollapsibleCardColor;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const colorClasses: Record<CollapsibleCardColor, string> = {
  green: "text-green-600",
  amber: "text-amber-600",
  purple: "text-purple-600",
  gray: "text-gray-500",
};

export function CollapsibleCard({
  title,
  count,
  icon,
  color = "gray",
  defaultOpen = false,
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className={`text-sm ${colorClasses[color]}`}>{icon}</span>}
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${colorClasses[color]}`}
          >
            {title}
          </h3>
          {count && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {count}
            </span>
          )}
        </div>
        <span
          className={`text-xs text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
