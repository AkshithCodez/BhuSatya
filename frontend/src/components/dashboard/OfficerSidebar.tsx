import { useNavigate } from 'react-router-dom';

interface OfficerSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export default function OfficerSidebar({ activeTab, onSelectTab }: OfficerSidebarProps) {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Officer Ananya Sharma';
  const userRole = localStorage.getItem('userRole') || 'revenue_officer';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'upload',
      label: 'Upload Document',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      action: () => navigate('/app/upload'),
    },
    {
      id: 'analysis',
      label: 'Document Analysis',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
      action: () => navigate('/app/documents/demo-1'),
    },
    {
      id: 'cases',
      label: 'Verification Cases',
      badge: '18',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      action: () => navigate('/app/review-queue'),
    },
    {
      id: 'records',
      label: 'Land Records',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
      action: () => navigate('/app/parcels'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      action: () => navigate('/app/audit'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const recentCases = [
    { id: '8819', name: 'Sale Deed #8819', district: 'Bengaluru Urban', time: '10:24 AM', status: 'processing' },
    { id: '4412', name: 'Mutation Record #4412', district: 'Mysuru', time: 'Yesterday', status: 'review' },
    { id: '3190', name: 'RTC Record #3190', district: 'Tumakuru', time: 'Sep 05', status: 'verified' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-[#0d1217] border-r border-white/[0.07] flex flex-col justify-between shrink-0 h-full select-none">
      {/* Top section: Officer greeting & Primary Nav */}
      <div className="p-4 space-y-4">
        {/* Officer Greeting Block (matches "Good Morning, Saeid" in reference) */}
        <div className="px-2 pt-2">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide uppercase text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Govt. of Karnataka · RoR</span>
          </div>
          <h2 className="text-sm text-slate-400 font-normal mt-1">Good Morning,</h2>
          <h1 className="text-base font-semibold text-white tracking-tight truncate">
            {userName.replace('(SSO Verified)', '')}
          </h1>
        </div>

        {/* Main Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-white border border-emerald-500/30 shadow-sm shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mini "Recent Cases" section in sidebar (matching "Recent Projects" in reference) */}
        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent Cases</span>
            <button 
              onClick={() => onSelectTab('dashboard')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-1.5">
            {recentCases.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate('/app/review-queue')}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/[0.03]"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-900/50 to-slate-900 flex items-center justify-center text-xs shrink-0 border border-white/10">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{c.district} · {c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section: Help & Sign Out */}
      <div className="p-4 border-t border-white/[0.07] space-y-2">
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="truncate">{userRole.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Support Helpdesk: 1800-425-LAND (Karnataka Revenue)')}
            className="flex-1 py-2 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors border border-white/[0.06] text-center"
          >
            Help Desk
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium transition-colors border border-red-500/20 text-center"
            title="Sign out of Officer Portal"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
