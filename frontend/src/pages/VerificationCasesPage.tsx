import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, type VerificationCase } from '../data/mockCases';

export default function VerificationCasesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Needs Review' | 'Approved' | 'Flagged'>('All');
  const [search, setSearch] = useState('');

  const cases = getCases();

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === 'All' ? true : c.status === filter;
    const matchesSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.surveyNo.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.village.toLowerCase().includes(search.toLowerCase()) ||
      c.docType.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const filterTabs: Array<'All' | 'Pending' | 'Needs Review' | 'Approved' | 'Flagged'> = [
    'All',
    'Pending',
    'Needs Review',
    'Approved',
    'Flagged',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verification Cases</h1>
          <p className="text-sm text-[#94A39B] mt-1">
            Review pending, flagged, and officer-approved land documents.
          </p>
        </div>

        {/* Local Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Case ID, Survey No., or Village"
            className="w-full h-10 px-3.5 rounded-xl bg-[#161E1B] border border-white/[0.08] text-xs text-white placeholder-[#64756D] focus:outline-none focus:border-emerald-500/40"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const count = tab === 'All' ? cases.length : cases.filter((c) => c.status === tab).length;
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-2 px-4 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2 border ${
                isActive
                  ? 'bg-emerald-700/30 text-white border-emerald-500/40 font-semibold'
                  : 'bg-[#161E1B] text-[#94A39B] border-white/[0.08] hover:text-white hover:bg-[#1E2824]'
              }`}
            >
              <span>{tab}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-[#94A39B]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl bg-[#161E1B] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold text-[#94A39B] uppercase tracking-wider bg-[#121816]">
                <th className="py-3 px-5">Case ID</th>
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5">Survey No.</th>
                <th className="py-3 px-5">Officer</th>
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
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-medium">
                    {c.id}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-white">{c.docType}</p>
                    <p className="text-[11px] text-[#94A39B]">{c.ownerName}</p>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A39B]">
                    {c.village}, {c.taluk}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-300">
                    Sy. {c.surveyNo}
                  </td>
                  <td className="py-3.5 px-5 text-[#94A39B]">{c.officer}</td>
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
                  <td colSpan={8} className="py-10 text-center text-xs text-[#94A39B]">
                    No cases match the selected filter or search criteria.
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
