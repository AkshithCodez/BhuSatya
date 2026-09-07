import { useState } from 'react';

export default function LandRecordsPage() {
  const [surveyQuery, setSurveyQuery] = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const records = [
    {
      id: 'REC-104-A',
      surveyNo: '104/A',
      owner: 'Basavaraj K. Gowda',
      fatherName: 'Late Kempe Gowda',
      village: 'Devanahalli',
      taluk: 'Devanahalli',
      district: 'Bengaluru Urban',
      extent: '2 Acres 14 Guntas',
      classification: 'Dry Bagayat',
      encumbrance: 'Nil (Clean Title)',
      lastMutation: '2026-08-14',
      status: 'Active · Validated',
    },
    {
      id: 'REC-42-3',
      surveyNo: '42/3',
      owner: 'Savitha M. Ranganath',
      fatherName: 'M. Ranganath',
      village: 'Hunsur Town',
      taluk: 'Hunsur',
      district: 'Mysuru',
      extent: '1 Acre 08 Guntas',
      classification: 'Wet Agricultural',
      encumbrance: 'SBI Agriculture Loan Active',
      lastMutation: '2026-07-22',
      status: 'Under Review',
    },
    {
      id: 'REC-88-B',
      surveyNo: '88/B',
      owner: 'Govindappa B.',
      fatherName: 'Bheemaiah',
      village: 'Tiptur Rural',
      taluk: 'Tiptur',
      district: 'Tumakuru',
      extent: '3 Acres 00 Guntas',
      classification: 'Garden Land (Coconut)',
      encumbrance: 'Nil',
      lastMutation: '2026-05-19',
      status: 'Active · Validated',
    },
    {
      id: 'REC-219-1',
      surveyNo: '219/1',
      owner: 'Mahaveer Patil',
      fatherName: 'Suresh Patil',
      village: 'Gokak Border',
      taluk: 'Gokak',
      district: 'Belagavi',
      extent: '4 Acres 20 Guntas',
      classification: 'Commercial Conversion Pending',
      encumbrance: 'Court Stay Order #104/2026',
      lastMutation: '2026-04-10',
      status: 'Disputed / Flagged',
    },
    {
      id: 'REC-15-2',
      surveyNo: '15/2',
      owner: 'Nanjunda Swamy',
      fatherName: 'Lingappa',
      village: 'Maddur North',
      taluk: 'Maddur',
      district: 'Mandya',
      extent: '1 Acre 32 Guntas',
      classification: 'Dry Agricultural',
      encumbrance: 'Nil',
      lastMutation: '2026-03-12',
      status: 'Active · Validated',
    },
  ];

  const filtered = records.filter((r) => {
    const matchesDistrict = district === 'All Districts' || r.district === district;
    const q = surveyQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.surveyNo.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.village.toLowerCase().includes(q);
    return matchesDistrict && matchesQuery;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Cadastral &amp; RoR Archive
          </span>
          <span className="text-xs text-slate-500 font-mono">BHOOMI INTEGRATION</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Land Records Search</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Query registered land parcels, survey sketches, ownership deeds, and mutation histories across Karnataka.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#11161d] border border-white/[0.08] flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={surveyQuery}
            onChange={(e) => setSurveyQuery(e.target.value)}
            placeholder="Search by Survey No., Owner Name, or Village..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 sm:w-48"
        >
          <option value="All Districts" className="bg-[#11161d]">All Districts</option>
          <option value="Bengaluru Urban" className="bg-[#11161d]">Bengaluru Urban</option>
          <option value="Mysuru" className="bg-[#11161d]">Mysuru</option>
          <option value="Tumakuru" className="bg-[#11161d]">Tumakuru</option>
          <option value="Belagavi" className="bg-[#11161d]">Belagavi</option>
          <option value="Mandya" className="bg-[#11161d]">Mandya</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="py-3 px-4">Survey Number</th>
              <th className="py-3 px-4">Registered Owner</th>
              <th className="py-3 px-4">Village / Taluk</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Extent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className="hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                  {r.surveyNo}
                </td>
                <td className="py-3 px-4 text-white font-medium">
                  {r.owner}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <span>{r.village}</span>
                  <span className="block text-[10px] text-slate-500">Taluk: {r.taluk}</span>
                </td>
                <td className="py-3 px-4 text-slate-400">{r.district}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{r.extent}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    r.status.includes('Active')
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : r.status.includes('Disputed')
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                    Inspect RoR →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Record Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#11161d] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400">SURVEY PARCEL RECORD</span>
                <h3 className="text-base font-bold text-white tracking-tight">Survey No: {selectedRecord.surveyNo}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Primary Owner:</span>
                <span className="font-semibold text-white">{selectedRecord.owner}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Father's Name:</span>
                <span className="font-semibold text-white">{selectedRecord.fatherName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Total Land Extent:</span>
                <span className="font-mono text-emerald-300">{selectedRecord.extent}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Classification:</span>
                <span className="text-slate-200">{selectedRecord.classification}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Encumbrance / Liabilities:</span>
                <span className="text-amber-300 font-medium">{selectedRecord.encumbrance}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] flex justify-between">
                <span className="text-slate-400">Last Mutation Timestamp:</span>
                <span className="font-mono text-slate-300">{selectedRecord.lastMutation}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => alert(`Exporting official Record of Rights for ${selectedRecord.surveyNo}...`)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Download Official RTC Extract (Pahani)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
