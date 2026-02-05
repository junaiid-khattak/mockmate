import { Card, CardContent } from "@/components/ui/card";

type AccessLevelsProps = {
  onSelect: (planId: "monthly" | "week_pass" | "one_off") => void;
};

type PlanOption = {
  id: "monthly" | "week_pass" | "one_off";
  title: string;
  description: string;
  highlighted?: boolean;
};

const options: PlanOption[] = [
  {
    id: "monthly",
    title: "Monthly access",
    description: "For active interview pipelines",
    highlighted: true,
  },
  {
    id: "week_pass",
    title: "Week pass",
    description: "For interview week",
  },
  {
    id: "one_off",
    title: "One evaluation",
    description: "Single full scorecard",
  },
];

export function AccessLevels({ onSelect }: AccessLevelsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-200">Access levels</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <button key={option.id} type="button" onClick={() => onSelect(option.id)} className="text-left">
            <Card
              className={[
                "border-slate-800/80 bg-slate-900/60 transition hover:border-slate-600 hover:bg-slate-900/80",
                option.highlighted ? "border-slate-600 bg-slate-900/80" : "",
              ].join(" ")}
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{option.title}</h4>
                </div>
                <p className="text-xs text-slate-300">{option.description}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
