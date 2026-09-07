import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardTopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function DashboardTopbar({ searchQuery, onSearchChange }: DashboardTopbarProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const userName = localStorage.getItem('userName') || 'Officer Ananya Sharma';

  const notifications = [
    { id: 1, title: 'Table extraction completed', caseId: 'BLR-2026-8819', time: '5m ago', unread: true },
    { id: 2, title: 'Potential seal anomaly flagged', caseId: 'BLG-2026-1048', time: '28m ago', unread: true },
    { id: 3, title: 'Survey sketch verified & hashed', caseId: 'TUM-2026-3190', time: '1h ago', unread: false },
  ];

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#0c1015]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none shrink-0">
      {/* ─── Center / Left: Search Bar (matches reference) ─── */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <svg
            className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Case ID, Survey No., Owner, Village, or Document"
            className="w-full h-10 pl-10 pr-12 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          ) : (
            <kbd className="absolute right-3 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* ─── Right: Status, Upload CTA, Notifications & Avatar ─── */}
      <div className="flex items-center gap-3">
        {/* Real-time System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Pipeline Online</span>
        </div>

        {/* Quick Upload Action */}
        <button
          onClick={() => navigate('/app/upload')}
          className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07130b] font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Upload Document</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 transition-colors relative"
            aria-label="Notifications"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c1015]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#131b22] border border-white/15 p-3 shadow-2xl z-50 text-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</span>
                <span className="text-[10px] text-emerald-400">2 Unread</span>
              </div>
              <div className="mt-2 space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/app/review-queue');
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                      n.unread ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="font-medium text-slate-100">{n.title}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span className="font-mono text-emerald-400">{n.caseId}</span>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Designation Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
            AS
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-100 leading-tight">
              {userName.replace('(SSO Verified)', '')}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">Revenue Officer · Gr. I</p>
          </div>
        </div>
      </div>
    </header>
  );
}
