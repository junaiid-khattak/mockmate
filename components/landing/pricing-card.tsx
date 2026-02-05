import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: boolean;
};

type Props = {
  plan: Plan;
};

export function PricingCard({ plan }: Props) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col border-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800",
        plan.highlighted ? "border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-500/10 dark:to-slate-900" : ""
      )}
    >
      {plan.popular ? (
        <Badge className="absolute right-4 top-4 bg-amber-500 text-white shadow-sm">Popular</Badge>
      ) : null}
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.highlighted ? (
            <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:border-indigo-500/50 dark:text-indigo-200">
              Recommended
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
        <div className="text-3xl font-semibold text-slate-900 dark:text-white">{plan.price}</div>
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
        <Button className="w-full" variant={plan.highlighted ? "default" : "secondary"}>
          {plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
