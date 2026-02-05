import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type BeginEvaluationCTAProps = {
  enabled: boolean;
  onStart: () => void;
};

export function BeginEvaluationCTA({ enabled, onStart }: BeginEvaluationCTAProps) {
  return (
    <div className="space-y-3">
      <Button className="w-full" variant="secondary" onClick={onStart} disabled={!enabled}>
        Begin 5-minute evaluation
      </Button>
      {!enabled ? (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5" />
          Attach resume to proceed.
        </div>
      ) : null}
      <div className="space-y-1 text-center text-xs text-slate-400">
        <p>Follow-ups included.</p>
        <p>Scored on clarity and depth.</p>
      </div>
    </div>
  );
}
