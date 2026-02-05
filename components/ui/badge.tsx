import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variant === "default"
          ? "border-transparent bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
        className
      )}
      {...props}
    />
  );
}
