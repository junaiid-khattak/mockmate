import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  className?: string;
};

export function FeatureCard({ title, description, icon: Icon, badge, className }: Props) {
  return (
    <Card className={cn("group h-full border-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800", className)}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-200">
            <Icon className="h-6 w-6" />
          </div>
          {badge ? <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">{badge}</Badge> : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
