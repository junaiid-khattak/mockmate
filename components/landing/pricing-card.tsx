import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: boolean;
  note?: string;
};

type Props = {
  plan: Plan;
  onCta?: () => void;
};

export function PricingCard({ plan, onCta }: Props) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col border-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800",
        plan.highlighted ? "border-mm-violet/20 bg-gradient-to-b from-mm-violet/[0.04] to-white" : ""
      )}
    >
      {plan.popular ? (
        <Badge className="absolute right-4 top-4 bg-amber-500 text-white shadow-sm">Popular</Badge>
      ) : null}
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.highlighted ? (
            <Badge variant="outline" className="border-mm-violet/20 text-mm-violet">
              Recommended
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
        <div className="text-3xl font-semibold text-slate-900 dark:text-white">{plan.price}</div>
        {plan.note && (
          <div className="flex items-start gap-2 rounded-lg border border-[#7c5cfc] bg-[#7c5cfc] px-3 py-2 shadow-[0_2px_8px_rgba(124,92,252,0.35)]">
            <span className="mt-0.5 shrink-0 text-sm">✨</span>
            <p className="text-xs font-semibold leading-snug text-white">{plan.note}</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          className="w-full"
          variant={plan.highlighted ? "default" : "secondary"}
          onClick={onCta}
        >
          {plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
