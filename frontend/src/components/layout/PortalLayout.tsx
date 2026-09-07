import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const userName = localStorage.getItem('userName') || 'Rajesh Kumar';
  const userRole = localStorage.getItem('userRole') || 'Revenue Officer';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      to: '/upload',
      label: 'Upload Document',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      to: '/analysis',
      label: 'Document Analysis',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
    },
    {
      to: '/verification',
      label: 'Verification Cases',
      badge: '18',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      ),
    },
    {
      to: '/land-records',
      label: 'Land Records',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      to: '/reports',
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
      to: '/audit-trail',
      label: 'Audit Trail',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F1513] text-[#F3F4F1] font-sans">
      {/* ═══════════════════════════════════════════
          1. EXACTLY ONE PERSISTENT SIDEBAR (240px)
          ═══════════════════════════════════════════ */}
      <aside className="w-60 bg-[#0A0E0D] border-r border-white/[0.08] flex flex-col justify-between shrink-0 h-full z-20">
        <div>
          {/* Header Brand */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/40 border border-emerald-500/30 flex items-center justify-center text-lg shadow-sm">
                🏛️
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight leading-none">BhuSatya</h1>
                <p className="text-[11px] text-[#94A39B] font-medium tracking-wide mt-1">
                  Land Record Verification
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#161E1B] text-white border border-emerald-500/30 font-semibold'
                      : 'text-[#94A39B] hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-400' : 'text-[#64756D]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Officer Profile & Actions */}
        <div className="p-4 border-t border-white/[0.06] bg-[#070A09]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E2824] border border-white/10 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {userName.replace('(SSO Verified)', '')}
              </p>
              <p className="text-[11px] text-[#94A39B] truncate mt-0.5">
                {userRole.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setShowHelpModal(true)}
              className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A39B] hover:text-white text-xs font-medium transition-colors border border-white/[0.06] flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Help</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 text-[#94A39B] hover:text-rose-300 text-xs font-medium transition-colors border border-white/[0.06] hover:border-rose-500/30 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          2. MAIN APPLICATION CONTENT AREA
          ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0F1513]">
        {/* Clean Top Bar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0A0E0D] px-8 flex items-center justify-between gap-6 shrink-0 z-10">
          {/* Universal Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <svg
                className="w-4 h-4 absolute left-3.5 text-[#64756D] pointer-events-none"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Case ID, Survey No., Owner, Village or Document"
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#161E1B] border border-white/[0.08] text-sm text-[#F3F4F1] placeholder-[#64756D] focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#64756D] hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Upload Document Primary CTA */}
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Upload Document</span>
            </button>

            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-xl bg-[#161E1B] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-[#94A39B] hover:text-white transition-colors relative"
                aria-label="Notifications"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2.5 right-2.5" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#161E1B] border border-white/[0.12] p-4 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    <span className="text-[11px] text-emerald-400">2 Pending</span>
                  </div>
                  <div className="space-y-2.5">
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/verification/BLR-2026-8819');
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-medium text-slate-200">Sale Deed Ready for Review</p>
                      <p className="text-[11px] text-[#94A39B] mt-0.5">Case #BLR-2026-8819 · Devanahalli</p>
                    </div>
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/verification/MYS-2026-4412');
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-medium text-amber-300">Variance in Mutation Record</p>
                      <p className="text-[11px] text-[#94A39B] mt-0.5">Case #MYS-2026-4412 · Hunsur Taluk</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Officer Profile Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
              <div className="w-9 h-9 rounded-xl bg-[#1E2824] border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-semibold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-white leading-tight">{userName}</p>
                <p className="text-[10px] text-[#94A39B]">Government Revenue Desk</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Canvas with comfortable padding */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161E1B] border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏛️</span>
                <h3 className="text-base font-semibold text-white">BhuSatya Officer Guidance</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#94A39B] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#94A39B] leading-relaxed">
              <p>
                <strong className="text-white">Primary Verification Workflow:</strong>
                <br />
                1. <strong>Upload Document:</strong> Ingest scanned deeds (PDF, PNG, TIFF) and enter village/survey coordinates.
                <br />
                2. <strong>AI Element Detection:</strong> Automated identification of text, tables, stamps, and signatures.
                <br />
                3. <strong>Officer Adjudication:</strong> The authorized officer reviews evidentiary detections and grants legal sign-off.
              </p>
              <p>
                <strong className="text-white">Department Helpdesk:</strong>
                <br />
                Email: support@bhusatya.gov.in · Toll Free: 1800-425-BHUMI
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
