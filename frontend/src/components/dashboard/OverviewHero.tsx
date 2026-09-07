export default function OverviewHero() {
  const stats = [
    { label: 'Processed Today', value: '142', change: '+18% vs yesterday', isPositive: true },
    { label: 'Pending Verification', value: '18', change: 'Avg wait: 14 min', isNeutral: true },
    { label: 'Flagged Cases', value: '4', change: 'Requires sign-off', isWarning: true },
    { label: 'Model Accuracy', value: '99.4%', change: 'Bilingual OCR & Table', isPositive: true },
  ];

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 select-none">
      {/* Heading block (matches reference "Create Something Amazing") */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Officer Operations Dashboard
          </span>
          <span className="text-[11px] text-slate-500 font-mono">v2.4.0 · Gov Production</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Land Record Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Manage digitization, verification, and review workflows efficiently with AI-assisted element detection.
        </p>
      </div>

      {/* Metrics pills (compact high-density status blocks) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="flex flex-col py-2 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 text-left"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white tracking-tight">{s.value}</span>
              <span
                className={`text-[10px] font-medium ${
                  s.isPositive
                    ? 'text-emerald-400'
                    : s.isWarning
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {s.change}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
