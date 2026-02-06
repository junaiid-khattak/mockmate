import { Button } from "@/components/ui/button";

type InitialEvaluationCTAProps = {
  enabled: boolean;
  onStart: () => void;
};

const includes = [
  "3 resume-specific questions",
  "At least one follow-up",
  "Partial scorecard preview",
];

export function InitialEvaluationCTA({ enabled, onStart }: InitialEvaluationCTAProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-100">Initial Evaluation (5 minutes)</h3>
        <p className="text-sm text-slate-400">
          A short, pressure-calibrated evaluation to assess clarity and depth.
        </p>
      </div>
      <ul className="space-y-2 text-sm text-slate-300">
        {includes.map((item) => (
          <li key={item} className="flex items-center justify-between">
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <Button className="w-full" onClick={onStart} disabled={!enabled}>
          Begin initial evaluation
        </Button>
        <p className="text-xs text-slate-400">No preparation required. Stops automatically.</p>
      </div>
    </section>
  );
}
