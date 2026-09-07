import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecords, type LandRecord } from '../data/mockRecords';

export default function LandRecordsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const records = getRecords();

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.recordId.toLowerCase().includes(search.toLowerCase()) ||
      r.surveyNo.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.village.toLowerCase().includes(search.toLowerCase()) ||
      r.taluk.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = districtFilter === 'All' || r.district === districtFilter;
    const matchesType = typeFilter === 'All' || r.recordType.includes(typeFilter);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: LandRecord['status']) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Flagged':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Land Records Archive</h1>
        <p className="text-sm text-[#94A39B] mt-1">
          Search and inspect cadastral parcels and Rights, Tenancy &amp; Crops (RoR) records.
        </p>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-3">
        {/* Universal Record Search */}
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Survey No., Owner, Village, Taluk or Record ID"
            className="w-full h-11 px-4 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white placeholder-[#64756D] focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-[#0F1513] border border-white/[0.08] text-xs text-[#94A39B] focus:text-white focus:outline-none focus:border-emerald-500/40"
          >
            <option value="All">All Districts</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Tumakuru">Tumakuru</option>
            <option value="Belagavi">Belagavi</option>
            <option value="Mandya">Mandya</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-[#0F1513] border border-white/[0.08] text-xs text-[#94A39B] focus:text-white focus:outline-none focus:border-emerald-500/40"
          >
            <option value="All">All Record Types</option>
            <option value="Sale Deed">Sale Deed</option>
            <option value="Mutation">Mutation Record</option>
            <option value="RTC">RTC Record</option>
            <option value="Partition">Partition Deed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-[#0F1513] border border-white/[0.08] text-xs text-[#94A39B] focus:text-white focus:outline-none focus:border-emerald-500/40"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Under Review">Under Review</option>
            <option value="Flagged">Flagged</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setDistrictFilter('All');
              setTypeFilter('All');
              setStatusFilter('All');
            }}
            className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Land Records Table */}
      <div className="rounded-2xl bg-[#161E1B] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold text-[#94A39B] uppercase tracking-wider bg-[#121816]">
                <th className="py-3 px-5">Record ID</th>
                <th className="py-3 px-5">Survey No.</th>
                <th className="py-3 px-5">Owner</th>
                <th className="py-3 px-5">Village</th>
                <th className="py-3 px-5">Taluk</th>
                <th className="py-3 px-5">District</th>
                <th className="py-3 px-5">Record Type</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredRecords.map((r) => (
                <tr
                  key={r.recordId}
                  onClick={() => navigate(`/land-records/${r.recordId}`)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-medium">
                    {r.recordId}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-white">
                    Sy. {r.surveyNo}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white">{r.ownerName}</td>
                  <td className="py-3.5 px-5 text-[#94A39B]">{r.village}</td>
                  <td className="py-3.5 px-5 text-[#94A39B]">{r.taluk}</td>
                  <td className="py-3.5 px-5 text-[#94A39B]">{r.district}</td>
                  <td className="py-3.5 px-5 text-slate-300">{r.recordType}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/land-records/${r.recordId}`);
                      }}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-xs text-[#94A39B]">
                    No land records match your search query or filters.
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
