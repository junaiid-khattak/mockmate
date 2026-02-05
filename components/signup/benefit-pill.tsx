import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  className?: string;
};

export function BenefitPill({ icon: Icon, label, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 text-indigo-500" />
      {label}
    </div>
  );
}
