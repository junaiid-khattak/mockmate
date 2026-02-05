import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionTitle({ eyebrow, title, subtitle, align = "left" }: Props) {
  return (
    <div className={cn("space-y-3", align === "center" ? "text-center mx-auto max-w-2xl" : "")}>
      {eyebrow ? (
        <Badge variant="outline" className="text-xs">
          {eyebrow}
        </Badge>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="text-base text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
