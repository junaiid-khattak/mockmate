import { Card, CardContent } from "@/components/ui/card";

export function FullEvaluationPreview() {
  return (
    <Card className="border-slate-800/80 bg-slate-900/50">
      <CardContent className="space-y-3 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Full evaluation includes</h3>
        <ul className="space-y-1 text-sm text-slate-300">
          <li>45 minutes of resume-based questioning</li>
          <li>Follow-ups when answers aren’t precise</li>
          <li>Scorecard + drills</li>
          <li>Hire / no-hire signal</li>
        </ul>
      </CardContent>
    </Card>
  );
}
