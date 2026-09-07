import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentCasesPanelProps {
  externalFilter?: string;
}

export default function RecentCasesPanel({ externalFilter = '' }: RecentCasesPanelProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'review' | 'verified' | 'flagged' | 'processing'>('all');

  const cases = [
    {
      id: 'BLR-2026-8819',
      title: 'Sale Deed Verification',
      type: 'Sale Deed',
      district: 'Bengaluru Urban',
      taluk: 'Devanahalli',
      surveyNo: '104/A',
      owner: 'Basavaraj K. Gowda',
      date: 'Today, 10:24 AM',
      status: 'Processing',
      statusCode: 'processing',
      risk: 'Low Risk',
      riskColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      detections: ['Table 99.2%', 'Text 98.4%', 'Seal 99.5%'],
    },
    {
      id: 'MYS-2026-4412',
      title: 'Mutation Record Review',
      type: 'Mutation Record',
      district: 'Mysuru',
      taluk: 'Hunsur',
      surveyNo: '42/3',
      owner: 'Savitha M. Ranganath',
      date: 'Yesterday, 4:31 PM',
      status: 'Needs Review',
      statusCode: 'review',
      risk: 'Medium Risk',
      riskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      detections: ['Signature Flagged', 'RTC Conflict'],
    },
    {
      id: 'TUM-2026-3190',
      title: 'RTC Record Processing',
      type: 'RTC Extract',
      district: 'Tumakuru',
      taluk: 'Tiptur',
      surveyNo: '88/B',
      owner: 'Govindappa B.',
      date: 'Sep 05, 2026',
      status: 'Verified',
      statusCode: 'verified',
      risk: 'Clean',
      riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      detections: ['100% Match', 'Hashed SHA-256'],
    },
    {
      id: 'BLG-2026-1048',
      title: 'Land Ownership Update',
      type: 'Khata Transfer',
      district: 'Belagavi',
      taluk: 'Gokak',
      surveyNo: '219/1',
      owner: 'Mahaveer Patil',
      date: 'Sep 04, 2026',
      status: 'Flagged',
      statusCode: 'flagged',
      risk: 'High Anomaly',
      riskColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      detections: ['Seal Stamp Mismatch', 'Boundary Mismatch'],
    },
    {
      id: 'MND-2026-7721',
      title: 'Khata Certificate Verification',
      type: 'Khata Extract',
      district: 'Mandya',
      taluk: 'Maddur',
      surveyNo: '15/2',
      owner: 'Nanjunda Swamy',
      date: 'Sep 03, 2026',
      status: 'Verified',
      statusCode: 'verified',
      risk: 'Clean',
      riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      detections: ['Auto-reconciled', 'Officer Approved'],
    },
    {
      id: 'DKN-2026-9034',
      title: 'Survey Sketch Validation',
      type: 'Survey Sketch',
      district: 'Dakshina Kannada',
      taluk: 'Puttur',
      surveyNo: '64/C',
      owner: 'Asha Hegde',
      date: 'Sep 02, 2026',
      status: 'Needs Review',
      statusCode: 'review',
      risk: 'Medium Risk',
      riskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      detections: ['Cadastral Polygon Check', 'Watermark Unclear'],
    },
  ];

  // Filtering by search query & category
  const filteredCases = cases.filter((c) => {
    const matchesFilter =
      activeFilter === 'all' || c.statusCode === activeFilter;
    const q = externalFilter.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.surveyNo.toLowerCase().includes(q) ||
      c.owner.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Needs Review':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Flagged':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="rounded-2xl bg-[#11161d]/85 border border-white/10 p-5 backdrop-blur-xl shadow-xl select-none">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Recent Verification Cases</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {filteredCases.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active land registry cases sorted by receipt timestamp and verification priority.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'review', label: 'Needs Review (2)' },
            { id: 'flagged', label: 'Flagged (1)' },
            { id: 'processing', label: 'Processing (1)' },
            { id: 'verified', label: 'Verified (2)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeFilter === f.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="py-3 px-4">Case ID &amp; Document</th>
              <th className="py-3 px-4">District / Taluk</th>
              <th className="py-3 px-4">Survey Parcel</th>
              <th className="py-3 px-4">Owner / Registrant</th>
              <th className="py-3 px-4">Detection Insights</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredCases.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => navigate('/app/review-queue')}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs">
                      📄
                    </span>
                    <div>
                      <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">{item.id} · {item.date}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="text-slate-200">{item.district}</span>
                  <span className="block text-[10px] text-slate-500">Taluk: {item.taluk}</span>
                </td>

                <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                  {item.surveyNo}
                </td>

                <td className="py-3 px-4 text-slate-200">
                  {item.owner}
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {item.detections.map((d, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate('/app/documents/demo-1')}
                      className="py-1 px-2.5 rounded-lg bg-white/[0.05] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[11px] font-medium transition-all"
                    >
                      Inspect AI
                    </button>
                    <button
                      onClick={() => navigate('/app/review-queue')}
                      className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-all"
                    >
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching land record cases found for "{externalFilter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
