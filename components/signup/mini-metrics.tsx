import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Gauge, Timer, Trophy } from "lucide-react";

type Metric = { label: string; value: string; hint: string; icon: React.ComponentType<{ className?: string }> };

const metrics: Metric[] = [
  { label: "Time to first mock", value: "6 min", hint: "upload to interview", icon: Timer },
  { label: "Confidence lift", value: "+32%", hint: "after 2 sessions", icon: Trophy },
  { label: "Quality score", value: "92/100", hint: "average Pro report", icon: Gauge },
];

export function MiniMetrics({ className }: { className?: string }) {
  return (
    <Card className={cn("grid grid-cols-3 divide-x divide-slate-200/70 overflow-hidden border-slate-200/80 bg-white/80 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70", className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col items-center gap-1 px-4 py-3 text-center">
          <metric.icon className="h-4 w-4 text-indigo-500" />
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{metric.value}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{metric.hint}</div>
        </div>
      ))}
    </Card>
  );
}
