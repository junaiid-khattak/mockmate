const steps = [
  { label: "Resume attached", status: "required" },
  { label: "Intro evaluation (5 min)", status: "pending" },
  { label: "Full evaluation (locked)", status: "locked" },
];

export function EvaluationSetupPanel() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Evaluation setup
        </p>
        <h1 className="text-xl font-semibold text-white">Evaluation ready</h1>
        <p className="text-sm text-slate-300">
          Attach your resume to generate role-calibrated questioning.
        </p>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs">
          <span className="uppercase tracking-wide text-slate-500">Readiness</span>
          <span className="text-slate-200">Ready</span>
        </div>
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-sm"
          >
            <span className="text-slate-200">
              {index + 1}. {step.label}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {step.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
