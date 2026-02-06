const points = [
  "Several leadership claims will require concrete, measurable examples.",
  "System decisions will be challenged beyond the initial explanation.",
  "Trade-offs and alternatives will be expected, not implied.",
];

export function PressurePoints() {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-slate-100">Where interviewers will press</h3>
      <ul className="space-y-2 text-sm text-slate-300">
        {points.map((point) => (
          <li key={point} className="rounded-xl border border-slate-800/60 bg-slate-900/30 px-4 py-3">
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
