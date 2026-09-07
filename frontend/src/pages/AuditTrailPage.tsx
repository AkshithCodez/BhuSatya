import { useState } from 'react';
import { getAuditLogs } from '../data/mockAuditLogs';

export default function AuditTrailPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const logs = getAuditLogs();

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      !search ||
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.officer.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.caseOrRecord.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Audit Trail</h1>
        <p className="text-sm text-[#94A39B] mt-1">
          Chronological record of all document ingestions, AI analyses, and officer sign-offs.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#161E1B] border border-white/[0.08]">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Officer, Action, or Case ID"
            className="w-full h-10 px-3.5 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-white placeholder-[#64756D] focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-[#94A39B] focus:text-white focus:outline-none focus:border-emerald-500/40"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl bg-[#161E1B] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold text-[#94A39B] uppercase tracking-wider bg-[#121816]">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Officer</th>
                <th className="py-3 px-5">Action</th>
                <th className="py-3 px-5">Case / Record</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 text-[#94A39B] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3.5 px-5 font-medium text-white">{log.officer}</td>
                  <td className="py-3.5 px-5">
                    <p className="text-white font-medium">{log.action}</p>
                    {log.notes && <p className="text-[11px] text-[#94A39B] mt-0.5">{log.notes}</p>}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-medium whitespace-nowrap">
                    {log.caseOrRecord}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#94A39B]">
                    No audit records match your search or filter.
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
