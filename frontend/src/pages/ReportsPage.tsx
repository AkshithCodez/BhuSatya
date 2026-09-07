export default function ReportsPage() {
  const reports = [
    { title: 'Weekly Land Digitization Summary', period: '01 Sep – 07 Sep 2026', records: '984 Records', status: 'Ready' },
    { title: 'District Adjudication Efficiency Index', period: 'August 2026', records: '4,120 Records', status: 'Ready' },
    { title: 'Boundary Discrepancy & Anomaly Audit', period: 'Q2 FY 2026-27', records: '48 Flagged Cases', status: 'Ready' },
    { title: 'Officer Turnaround Time Report', period: 'August 2026', records: '38 Officers', status: 'Ready' },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Governance Intelligence
          </span>
          <span className="text-xs text-slate-500 font-mono">EXPORT MODULE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports &amp; Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate formal departmental summaries, throughput metrics, and audit statements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span className="font-mono">{rep.period}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  {rep.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">{rep.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Scope: {rep.records}</p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => alert(`Generating ${rep.title} PDF download...`)}
                className="py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all"
              >
                Download Official Report ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
