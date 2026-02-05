import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-slate-200 dark:bg-slate-800"
          : "w-px h-full bg-slate-200 dark:bg-slate-800",
        className
      )}
      role="separator"
    />
  );
}
