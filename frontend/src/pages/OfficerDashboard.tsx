import { useNavigate, useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  searchQuery: string;
}

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const context = useOutletContext<DashboardOutletContext>();
  const searchQuery = context?.searchQuery || '';

  // 1. High-Value Summary Stats
  const summaryStats = [
    { label: 'Documents Processed Today', value: '142', change: '+18% vs yesterday', color: 'text-emerald-400' },
    { label: 'Pending Verification', value: '18', change: 'Avg wait: 14 min', color: 'text-amber-400' },
    { label: 'Flagged Cases', value: '4', change: 'Requires officer sign-off', color: 'text-rose-400' },
    { label: 'Total Active Records', value: '1,280', change: 'Karnataka RoR archive', color: 'text-slate-200' },
  ];

  // 2. 4 Compact Feature Shortcut Cards
  const shortcuts = [
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Upload scanned land records for processing',
      route: '/upload',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      bgGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-950/30',
    },
    {
      id: 'analysis',
      title: 'Document Analysis',
      description: 'Review detected text, tables, stamps and signatures',
      route: '/analysis',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
      bgGlow: 'hover:border-cyan-500/40 hover:shadow-cyan-950/30',
    },
    {
      id: 'verification',
      title: 'Verification Cases',
      description: 'Review pending, flagged and completed cases',
      route: '/verification',
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      ),
      bgGlow: 'hover:border-amber-500/40 hover:shadow-amber-950/30',
    },
    {
      id: 'records',
      title: 'Land Records',
      description: 'Search survey and ownership records',
      route: '/land-records',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
      bgGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-950/30',
    },
  ];

  // 3. Compact Recent Cases (4-6 cases)
  const recentCases = [
    {
      id: 'BLR-2026-8819',
      docType: 'Sale Deed',
      location: 'Bengaluru Urban · Devanahalli',
      surveyNo: 'Sy. 104/A',
      status: 'Processing',
      time: 'Today, 10:24 AM',
      statusColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'MYS-2026-4412',
      docType: 'Mutation Record',
      location: 'Mysuru · Hunsur',
      surveyNo: 'Sy. 42/3',
      status: 'Needs Review',
      time: 'Yesterday, 4:31 PM',
      statusColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      id: 'TUM-2026-3190',
      docType: 'RTC Extract',
      location: 'Tumakuru · Tiptur',
      surveyNo: 'Sy. 88/B',
      status: 'Verified',
      time: 'Sep 05, 2026',
      statusColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'BLG-2026-1048',
      docType: 'Land Ownership Update',
      location: 'Belagavi · Gokak',
      surveyNo: 'Sy. 219/1',
      status: 'Flagged',
      time: 'Sep 04, 2026',
      statusColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    {
      id: 'MND-2026-7721',
      docType: 'Khata Certificate',
      location: 'Mandya · Maddur',
      surveyNo: 'Sy. 15/2',
      status: 'Verified',
      time: 'Sep 03, 2026',
      statusColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
  ];

  // Filtering based on topbar search input
  const filteredCases = recentCases.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.id.toLowerCase().includes(q) ||
      c.docType.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.surveyNo.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 select-none">
      {/* ─── 1. TOP OVERVIEW AREA ─── */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Command Center
            </span>
            <span className="text-xs text-slate-500 font-mono">Karnataka Land Governance Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Land Record Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manage digitization, verification, and review workflows efficiently.
          </p>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.color}`}>●</span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-2">{stat.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. QUICK ACCESS / FEATURE SHORTCUTS (4 Compact Cards) ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Feature Shortcuts
          </h2>
          <span className="text-xs text-slate-500 font-mono">DIRECT WORKFLOW ACCESS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcuts.map((sc) => (
            <div
              key={sc.id}
              onClick={() => navigate(sc.route)}
              className={`group p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] ${sc.bgGlow} transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {sc.icon}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {sc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                <span>Open</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3 & 4. MIDDLE SECTION: RECENT CASES + QUICK ACTIONS / SUMMARY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Compact Recent Cases Table */}
        <section className="lg:col-span-2 p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Recent Cases</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest land records submitted for officer adjudication
                </p>
              </div>
              <button
                onClick={() => navigate('/verification')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View All Cases →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2.5 px-3.5">Case ID</th>
                    <th className="py-2.5 px-3.5">Document Type</th>
                    <th className="py-2.5 px-3.5">Location</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Time</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate('/verification')}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono font-semibold text-emerald-400">
                        {c.id}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-200">
                        {c.docType}
                      </td>
                      <td className="py-3 px-3.5 text-slate-400">
                        <span>{c.location}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{c.surveyNo}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${c.statusColor}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right text-slate-400 text-[11px]">
                        {c.time}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/analysis');
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        No recent cases found matching "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right (1 Col): Quick Actions + Compact Pipeline Activity Summary */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <section className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm">
            <h2 className="text-sm font-semibold text-white tracking-tight mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Upload New Document', route: '/upload', icon: '📤' },
                { label: 'New Verification Case', route: '/verification', icon: '📋' },
                { label: 'Search Land Record', route: '/land-records', icon: '🔍' },
                { label: 'Review Flagged Cases', route: '/verification', icon: '⚠️' },
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(act.route)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] text-xs font-medium text-slate-300 hover:text-white transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{act.icon}</span>
                    <span>{act.label}</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">→</span>
                </button>
              ))}
            </div>
          </section>

          {/* Compact Activity / Pipeline Summary Card */}
          <section className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white tracking-tight">AI Pipeline Status</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Queued Records:</span>
                <span className="font-mono text-slate-200 font-bold">8 Documents</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Latest Extracted:</span>
                <span className="font-mono text-emerald-400">#BLR-2026-8819</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Model Precision:</span>
                <span className="font-mono text-emerald-400 font-bold">99.4% Avg</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/analysis')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-all text-center block"
            >
              Open Full Analysis Workspace →
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
