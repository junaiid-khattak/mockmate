const bullets = [
  "45 minutes of structured questioning",
  "Resume-specific pressure testing",
  "Clear hire / no-hire signal",
  "Written feedback and improvement drills",
];

export function LockedContinuation() {
  return (
    <section className="pointer-events-none select-none space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6 opacity-60 blur-[0.4px]">
      <h3 className="text-base font-semibold text-slate-100">Full interview evaluation includes</h3>
      <ul className="space-y-2 text-sm text-slate-300">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">Available after initial evaluation.</p>
    </section>
  );
}
