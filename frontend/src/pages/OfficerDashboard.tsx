import { useNavigate, useOutletContext } from 'react-router-dom';
import { getCases, type VerificationCase } from '../data/mockCases';

interface DashboardOutletContext {
  searchQuery: string;
}

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const context = useOutletContext<DashboardOutletContext>();
  const searchQuery = context?.searchQuery?.toLowerCase() || '';

  const userName = localStorage.getItem('userName') || 'Rajesh';
  const firstName = userName.split(' ')[0] || 'Rajesh';

  const allCases = getCases();

  // Summary counts computed from centralized data
  const pendingCount = allCases.filter((c) => c.status === 'Pending').length;
  const needsReviewCount = allCases.filter((c) => c.status === 'Needs Review').length;

  const stats = [
    {
      label: 'Processed Today',
      value: '142',
      trend: '+18% vs yesterday',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      label: 'Pending Verification',
      value: String(pendingCount > 0 ? pendingCount : 18),
      trend: 'Avg wait: 14 min',
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: 'Needs Review',
      value: String(needsReviewCount > 0 ? needsReviewCount : 4),
      trend: 'Requires officer review',
      icon: (
        <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Active Land Records',
      value: '1,280',
      trend: 'Karnataka RoR archive',
      icon: (
        <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
  ];

  const shortcuts = [
    {
      title: 'Upload Document',
      description: 'Add scanned land documents for AI-assisted processing.',
      route: '/upload',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      title: 'Document Analysis',
      description: 'Review detected text, tables, stamps and signatures.',
      route: '/analysis',
      icon: (
        <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
    },
    {
      title: 'Verification Cases',
      description: 'Review pending and flagged cases.',
      route: '/verification',
      icon: (
        <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      ),
    },
    {
      title: 'Land Records',
      description: 'Search and inspect land records.',
      route: '/land-records',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
  ];

  // Filter cases if user entered search query, limit to 5
  const filteredCases = allCases.filter((c) => {
    if (!searchQuery) return true;
    return (
      c.id.toLowerCase().includes(searchQuery) ||
      c.surveyNo.toLowerCase().includes(searchQuery) ||
      c.ownerName.toLowerCase().includes(searchQuery) ||
      c.village.toLowerCase().includes(searchQuery) ||
      c.docType.toLowerCase().includes(searchQuery)
    );
  }).slice(0, 5);

  const getStatusBadge = (status: VerificationCase['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Needs Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Flagged':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Pending':
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── A. Welcome / Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-400 mb-1">
            Good Morning, {firstName}
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Land Record Operations
          </h1>
          <p className="text-sm text-[#94A39B] mt-1">
            Manage document digitization, verification and land-record workflows from one place.
          </p>
        </div>

        {/* Quick Actions (Minimal row) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/upload')}
            className="py-2 px-3 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            + Upload New Document
          </button>
          <button
            onClick={() => navigate('/verification')}
            className="py-2 px-3 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Review Pending Cases
          </button>
          <button
            onClick={() => navigate('/land-records')}
            className="py-2 px-3 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Search Land Record
          </button>
        </div>
      </div>

      {/* ─── B. 4 Summary Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#161E1B] border border-white/[0.08] flex items-start justify-between"
          >
            <div>
              <p className="text-xs text-[#94A39B] font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-[#64756D] mt-1">{stat.trend}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ─── C. 4 Feature Shortcut Cards (Main Visual Focus) ─── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Core Workflows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              onClick={() => navigate(shortcut.route)}
              className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#19221F] cursor-pointer transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E2824] border border-white/[0.08] flex items-center justify-center mb-4 group-hover:border-emerald-500/30 transition-colors">
                  {shortcut.icon}
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {shortcut.title}
                </h3>
                <p className="text-xs text-[#94A39B] mt-2 leading-relaxed">
                  {shortcut.description}
                </p>
              </div>

              <div className="pt-6 flex items-center text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Open</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── D. Recent Cases (Clean Table, Max 5 Rows) ─── */}
      <div className="rounded-2xl bg-[#161E1B] border border-white/[0.08] overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Cases</h2>
            <p className="text-xs text-[#94A39B] mt-0.5">
              Latest land-record verification and digitization files
            </p>
          </div>
          <button
            onClick={() => navigate('/verification')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Cases</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-[#94A39B] uppercase tracking-wider bg-[#121816]">
                <th className="py-3 px-5">Case ID</th>
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Updated</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/verification/${c.id}`)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-medium">{c.id}</td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-white">{c.docType}</p>
                    <p className="text-[11px] text-[#94A39B]">Sy. {c.surveyNo}</p>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A39B]">
                    {c.district} · {c.taluk}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A39B]">{c.updatedAt}</td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/verification/${c.id}`);
                      }}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Review →
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#94A39B]">
                    No cases match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
