import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileSearch,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  Search,
  Settings,
  Upload,
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { StatusBadge } from '../ui/Badge';
import BhuSatyaLogo from '../branding/BhuSatyaLogo';
import { getCases } from '../../data/mockCases';
import { getRecords } from '../../data/mockRecords';
import { getAuditLogs } from '../../data/mockAuditLogs';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const WORK: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload Document', to: '/upload', icon: Upload },
  { label: 'Document Analysis', to: '/analysis', icon: FileSearch },
  { label: 'Verification Cases', to: '/verification', icon: ClipboardCheck },
  { label: 'Land Records', to: '/land-records', icon: Map },
];

const MANAGEMENT: NavItem[] = [
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Audit Trail', to: '/audit-trail', icon: History },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const CRUMBS: Record<string, string> = {
  dashboard: 'Dashboard',
  upload: 'Upload Document',
  processing: 'Processing',
  analysis: 'Document Analysis',
  verification: 'Verification Cases',
  'land-records': 'Land Records',
  reports: 'Reports',
  'audit-trail': 'Audit Trail',
  settings: 'Settings',
};

function initialsOf(name: string) {
  return name
    .replace(/^Officer\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const officerName = localStorage.getItem('userName') || 'Officer Rajesh Kumar';
  const officerRole = localStorage.getItem('userRole') || 'Revenue Verification Officer';

  /* ── Global search over cases + records ─────────────────────── */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const cases = getCases()
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.surveyNo.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((c) => ({
        key: `case-${c.id}`,
        title: c.id,
        meta: `${c.docType} · ${c.district}`,
        status: c.status,
        to: `/verification/${c.id}`,
      }));
    const records = getRecords()
      .filter(
        (r) =>
          r.recordId.toLowerCase().includes(q) ||
          r.surveyNo.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.village.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((r) => ({
        key: `rec-${r.recordId}`,
        title: r.recordId,
        meta: `Survey ${r.surveyNo} · ${r.village}`,
        status: r.status,
        to: `/land-records/${r.recordId}`,
      }));
    return [...cases, ...records];
  }, [query]);

  const notifications = getAuditLogs().slice(0, 4);

  /* ── Dismiss popovers on outside click ──────────────────────── */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const goTo = (to: string) => {
    setQuery('');
    setSearchOpen(false);
    setNotifOpen(false);
    navigate(to);
  };

  /* ── Breadcrumb ─────────────────────────────────────────────── */
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) =>
    i === 0 ? CRUMBS[seg] ?? seg : decodeURIComponent(seg)
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 h-9 px-3 rounded-ctl text-[13px] transition-colors ${
      isActive
        ? 'bg-raised text-ink font-medium'
        : 'text-ink-2 hover:text-ink hover:bg-white/[0.04]'
    }`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page">
      {/* ══ Sidebar ══════════════════════════════════════════════ */}
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-line bg-sidebar">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90"
          >
            <BhuSatyaLogo variant="mark" size="md" className="shrink-0 drop-shadow-sm" />
            <div>
              <p className="text-[16px] font-semibold text-ink tracking-[-0.01em] leading-none">
                Bhu<span className="text-emerald-400">Satya</span>
              </p>
              <p className="mt-1 text-[11px] text-ink-3">Land Record Verification</p>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4" ref={searchRef}>
          <div className="relative">
            <Search
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search cases, records"
              className="w-full h-9 rounded-ctl border border-line bg-panel pl-[34px] pr-3 text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
            />

            {searchOpen && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-11 z-40 rounded-card border border-line bg-panel py-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.85)]">
                {results.length === 0 ? (
                  <p className="px-3 py-3 text-[12.5px] text-ink-3">No matches found.</p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => goTo(r.to)}
                      className="w-full px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="tnum block text-[12.5px] text-ink">{r.title}</span>
                      <span className="block text-[11.5px] text-ink-3 truncate">{r.meta}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-slim px-4 pb-4">
          <div className="space-y-0.5">
            {WORK.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={15.5} strokeWidth={1.9} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>

          <p className="px-3 pt-6 pb-2 text-[10.5px] font-medium tracking-[0.09em] text-ink-3">
            MANAGEMENT
          </p>
          <div className="space-y-0.5">
            {MANAGEMENT.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={15.5} strokeWidth={1.9} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Officer */}
        <div className="border-t border-line px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-raised text-[11.5px] font-semibold text-ink-2">
              {initialsOf(officerName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">
                {officerName.replace(/^Officer\s+/i, '')}
              </p>
              <p className="truncate text-[11px] text-ink-3">{officerRole}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="grid place-items-center h-8 w-8 shrink-0 rounded-ctl text-ink-3 hover:text-ink hover:bg-white/5 transition-colors"
            >
              <LogOut size={15} strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ Main column ══════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-15 shrink-0 items-center justify-between gap-4 border-b border-line bg-page px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0 text-[13px]">
            <span className="text-ink-3">BhuSatya</span>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                <span className="text-ink-3/60">/</span>
                <span
                  className={`truncate ${
                    i === crumbs.length - 1 ? 'text-ink font-medium' : 'text-ink-3'
                  }`}
                >
                  {c}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title="Help"
              aria-label="Help"
              className="grid place-items-center h-9 w-9 rounded-ctl text-ink-3 hover:text-ink hover:bg-white/5 transition-colors"
            >
              <HelpCircle size={16.5} strokeWidth={1.9} />
            </button>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                title="Notifications"
                aria-label="Notifications"
                className="grid place-items-center h-9 w-9 rounded-ctl text-ink-3 hover:text-ink hover:bg-white/5 transition-colors"
              >
                <Bell size={16.5} strokeWidth={1.9} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 z-40 w-[330px] rounded-card border border-line bg-panel shadow-[0_16px_40px_-16px_rgba(0,0,0,0.85)]">
                  <p className="border-b border-line px-4 py-3 text-[13px] font-medium text-ink">
                    Recent activity
                  </p>
                  <div className="max-h-[300px] overflow-y-auto scrollbar-slim">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => goTo(`/verification/${n.caseOrRecord}`)}
                        className="w-full border-b border-line/70 px-4 py-3 text-left last:border-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="tnum text-[12.5px] text-ink">{n.caseOrRecord}</span>
                          <StatusBadge status={n.status} />
                        </div>
                        <p className="mt-1 text-[12px] text-ink-2 line-clamp-2">{n.action}</p>
                        <p className="mt-1 text-[11px] text-ink-3">{n.timestamp}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo('/audit-trail')}
                    className="w-full border-t border-line px-4 py-3 text-left text-[12.5px] font-medium text-ink-2 hover:text-ink transition-colors"
                  >
                    View full audit trail
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              title={officerName}
              className="grid place-items-center h-8 w-8 rounded-full bg-raised text-[11.5px] font-semibold text-ink-2 hover:text-ink transition-colors"
            >
              {initialsOf(officerName)}
            </button>

            <Button
              variant="primary"
              size="sm"
              className="ml-2"
              icon={<Upload size={14} strokeWidth={2} />}
              onClick={() => navigate('/upload')}
            >
              Upload Document
            </Button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto scrollbar-slim">
          <div className="mx-auto w-full max-w-[1360px] px-6 py-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="How verification works"
        subtitle="Four steps from scanned document to an updated land record."
        width={520}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setHelpOpen(false)}>
            Close
          </Button>
        }
      >
        <ol className="space-y-3.5">
          {[
            ['Upload the document', 'Add the scan and its district, taluk, village and survey number.'],
            ['Review the analysis', 'Detected text, tables, signatures and stamps are highlighted on the page.'],
            ['Record your decision', 'Approve, send for manual review, or reject with a note.'],
            ['Land record updates', 'Approved cases update the record and are written to the audit trail.'],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-3">
              <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-raised text-[12px] font-medium text-ink-2">
                {i + 1}
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-[12.5px] text-ink-3">
          For access or account issues, contact the district administrator.
        </p>
      </Modal>
    </div>
  );
}
