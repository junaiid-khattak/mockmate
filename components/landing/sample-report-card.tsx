import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sparkles, ThumbsUp, Timer, Target } from "lucide-react";

type ScoreItem = {
  label: string;
  value: number;
};

type Props = {
  headline?: string;
  role?: string;
  scores?: ScoreItem[];
  className?: string;
};

const defaultScores: ScoreItem[] = [
  { label: "Communication", value: 92 },
  { label: "Technical Depth", value: 88 },
  { label: "Structure", value: 90 },
  { label: "Confidence", value: 85 },
];

export function SampleReportCard({
  headline = "Senior Product Designer",
  role = "Google · L5",
  scores = defaultScores,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-slate-200/80 shadow-lg backdrop-blur-md dark:border-slate-800",
        className
      )}
    >
      <div className="absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-blue-500/20 blur-3xl" />
      <CardHeader className="relative z-10 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI Report • MockMate
        </div>
        <CardTitle className="text-xl text-slate-900 dark:text-white">{headline}</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300">{role}</p>
      </CardHeader>
      <CardContent className="relative z-10 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {scores.map((score) => (
            <div key={score.label} className="space-y-2 rounded-2xl border border-slate-100/70 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100">
                <span>{score.label}</span>
                <span>{score.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="grid gap-3 sm:grid-cols-3">
          <Insight icon={ThumbsUp} label="Strength" value="Clear product thinking" />
          <Insight icon={Timer} label="Pacing" value="Answers in 65s avg" />
          <Insight icon={Target} label="Next step" value="Polish metrics narratives" />
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
          Ready to share with your mentor
        </Badge>
      </CardContent>
    </Card>
  );
}

type InsightProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function Insight({ icon: Icon, label, value }: InsightProps) {
  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white/60 p-3 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
