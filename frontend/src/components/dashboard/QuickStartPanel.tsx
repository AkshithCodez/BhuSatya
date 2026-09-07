import { useNavigate } from 'react-router-dom';

export default function QuickStartPanel() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-case',
      title: 'New Verification Case',
      desc: 'Initialize manual or automated deed review',
      icon: (
        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
      action: () => navigate('/app/upload'),
    },
    {
      id: 'upload-doc',
      title: 'Upload New Document',
      desc: 'Process PDF, TIFF or high-resolution scan',
      icon: (
        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      action: () => navigate('/app/upload'),
    },
    {
      id: 'search-survey',
      title: 'Search Survey Number',
      desc: 'Lookup geo-cadastral parcel & revenue records',
      icon: (
        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      action: () => navigate('/app/parcels'),
    },
    {
      id: 'review-flagged',
      title: 'Review Flagged Cases',
      desc: 'Address high-risk anomalies and boundary disputes',
      icon: (
        <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      action: () => navigate('/app/review-queue'),
    },
  ];

  return (
    <div className="rounded-2xl bg-[#11161d]/80 border border-white/10 p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl select-none">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Quick Start</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">ASSISTED ACTIONS</span>
        </div>

        <div className="space-y-2.5">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={act.action}
              className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] hover:border-emerald-500/30 cursor-pointer transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-white/[0.1] border border-white/10 flex items-center justify-center shrink-0 transition-colors">
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {act.desc}
                </p>
              </div>
              <span className="text-slate-500 group-hover:text-emerald-400 text-xs font-bold transition-colors">
                +
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini tip block */}
      <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
        <span className="text-xs">💡</span>
        <span>Double-click any case row below for full element overlay review.</span>
      </div>
    </div>
  );
}
