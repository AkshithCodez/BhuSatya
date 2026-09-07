export default function ReportsPage() {
  const summaryMetrics = [
    { label: 'Documents Processed', value: '1,420', sub: 'Across 6 revenue districts', color: 'text-emerald-400' },
    { label: 'Pending Verification', value: '18', sub: 'Avg queue latency: 14 min', color: 'text-amber-400' },
    { label: 'Approved Cases', value: '1,388', sub: '97.7% verification compliance', color: 'text-teal-400' },
    { label: 'Cases Requiring Review', value: '14', sub: 'Boundary & signature checks', color: 'text-rose-400' },
  ];

  const districtData = [
    { district: 'Bengaluru Urban', count: 480, pct: '34%' },
    { district: 'Mysuru', count: 320, pct: '23%' },
    { district: 'Tumakuru', count: 260, pct: '18%' },
    { district: 'Belagavi', count: 190, pct: '13%' },
    { district: 'Mandya', count: 170, pct: '12%' },
  ];

  const monthlyTrend = [
    { month: 'Apr', count: 180, height: '40%' },
    { month: 'May', count: 220, height: '52%' },
    { month: 'Jun', count: 290, height: '68%' },
    { month: 'Jul', count: 310, height: '74%' },
    { month: 'Aug', count: 380, height: '88%' },
    { month: 'Sep', count: 420, height: '98%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Executive Reports</h1>
          <p className="text-sm text-[#94A39B] mt-1">
            High-level throughput and jurisdictional verification metrics.
          </p>
        </div>
        <button
          onClick={() => alert('Monthly Land Records Summary exported.')}
          className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          Export Summary Report
        </button>
      </div>

      {/* 4 Key Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#161E1B] border border-white/[0.08]">
            <p className="text-xs text-[#94A39B] font-medium">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 tracking-tight ${m.color}`}>{m.value}</p>
            <p className="text-[11px] text-[#64756D] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* 2 Simple Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Throughput (Simple Bar Chart) */}
        <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-base font-semibold text-white">Monthly Verification Volume</h2>
            <span className="text-xs text-[#94A39B]">FY 2026-27</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2">
            {monthlyTrend.map((t) => (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono text-[#94A39B]">{t.count}</span>
                <div
                  style={{ height: t.height }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-emerald-800 to-emerald-500 rounded-t-md transition-all duration-300"
                />
                <span className="text-xs text-[#94A39B] font-medium">{t.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: District Throughput Distribution */}
        <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-base font-semibold text-white">District Volume Distribution</h2>
            <span className="text-xs text-[#94A39B]">Karnataka Revenue</span>
          </div>

          <div className="space-y-3 pt-2">
            {districtData.map((d) => (
              <div key={d.district} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{d.district}</span>
                  <span className="font-mono text-[#94A39B]">{d.count} docs ({d.pct})</span>
                </div>
                <div className="h-2 w-full bg-[#0F1513] rounded-full overflow-hidden">
                  <div
                    style={{ width: d.pct }}
                    className="h-full bg-emerald-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
