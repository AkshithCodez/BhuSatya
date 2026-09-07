import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerificationCasesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'review' | 'verified' | 'flagged'>('all');
  const [search, setSearch] = useState('');

  const [cases, setCases] = useState([
    {
      id: 'BLR-2026-8819',
      docType: 'Sale Deed',
      district: 'Bengaluru Urban',
      taluk: 'Devanahalli',
      surveyNo: '104/A',
      owner: 'Basavaraj K. Gowda',
      assignedOfficer: 'Officer Ananya Sharma',
      date: 'Today, 10:24 AM',
      status: 'Needs Review',
      statusCode: 'review',
      evidenceSummary: 'Table (99.2%), Text (98.4%), Stamp (99.5%), Signature (98.7%)',
    },
    {
      id: 'MYS-2026-4412',
      docType: 'Mutation Record',
      district: 'Mysuru',
      taluk: 'Hunsur',
      surveyNo: '42/3',
      owner: 'Savitha M. Ranganath',
      assignedOfficer: 'Officer Ananya Sharma',
      date: 'Yesterday, 4:31 PM',
      status: 'Needs Review',
      statusCode: 'review',
      evidenceSummary: 'Signature stroke variance flagged against master seal archive.',
    },
    {
      id: 'TUM-2026-3190',
      docType: 'RTC Extract',
      district: 'Tumakuru',
      taluk: 'Tiptur',
      surveyNo: '88/B',
      owner: 'Govindappa B.',
      assignedOfficer: 'Officer Ananya Sharma',
      date: 'Sep 05, 2026',
      status: 'Verified',
      statusCode: 'verified',
      evidenceSummary: '100% parcel boundary match. Hashed and cryptographically logged.',
    },
    {
      id: 'BLG-2026-1048',
      docType: 'Land Ownership Update',
      district: 'Belagavi',
      taluk: 'Gokak',
      surveyNo: '219/1',
      owner: 'Mahaveer Patil',
      assignedOfficer: 'Senior Nodal Officer',
      date: 'Sep 04, 2026',
      status: 'Flagged',
      statusCode: 'flagged',
      evidenceSummary: 'Boundary survey coordinates dispute with neighboring parcel 219/2.',
    },
    {
      id: 'MND-2026-7721',
      docType: 'Khata Certificate',
      district: 'Mandya',
      taluk: 'Maddur',
      surveyNo: '15/2',
      owner: 'Nanjunda Swamy',
      assignedOfficer: 'Officer Ananya Sharma',
      date: 'Sep 03, 2026',
      status: 'Verified',
      statusCode: 'verified',
      evidenceSummary: 'Reconciled with Taluk records. Signed off by Deputy Tehsildar.',
    },
    {
      id: 'DKN-2026-9034',
      docType: 'Survey Sketch',
      district: 'Dakshina Kannada',
      taluk: 'Puttur',
      surveyNo: '64/C',
      owner: 'Asha Hegde',
      assignedOfficer: 'Officer Ananya Sharma',
      date: 'Sep 02, 2026',
      status: 'Needs Review',
      statusCode: 'review',
      evidenceSummary: 'Cadastral polygon coordinates require physical surveyor re-check.',
    },
  ]);

  const handleDecision = (id: string, newStatus: 'Verified' | 'Needs Review' | 'Flagged') => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              statusCode:
                newStatus === 'Verified'
                  ? 'verified'
                  : newStatus === 'Flagged'
                  ? 'flagged'
                  : 'review',
            }
          : c
      )
    );
  };

  const filtered = cases.filter((c) => {
    const matchesTab = activeTab === 'all' || c.statusCode === activeTab;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.owner.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.surveyNo.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Officer Adjudication Desk
            </span>
            <span className="text-xs text-slate-500 font-mono">SECTION 14(A) ROR</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verification Cases</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review pending, flagged, and verified land-record cases. AI highlights evidence; the officer makes the legal decision.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07130b] text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          + Ingest New Case
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Cases (6)' },
            { id: 'review', label: 'Needs Review (3)' },
            { id: 'flagged', label: 'Flagged / Disputed (1)' },
            { id: 'verified', label: 'Verified & Approved (2)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter cases by ID or Survey No..."
            className="w-64 h-9 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] hover:border-white/15 transition-all shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-sm font-mono">
                  📋
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight">{item.docType}</h3>
                    <span className="font-mono text-xs text-emerald-400 font-semibold">{item.id}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {item.district} · {item.taluk} · Survey No: <strong className="text-slate-200">{item.surveyNo}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    item.status === 'Verified'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : item.status === 'Flagged'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{item.date}</span>
              </div>
            </div>

            {/* Evidence & Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Registered Owner</span>
                <span className="font-medium text-slate-200">{item.owner}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Assigned Officer</span>
                <span className="font-medium text-slate-200">{item.assignedOfficer}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">AI Evidence Insight</span>
                <span className="font-medium text-emerald-300">{item.evidenceSummary}</span>
              </div>
            </div>

            {/* Officer Decision Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={() => navigate('/analysis')}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                <span>Inspect AI Bounding Boxes</span>
                <span>→</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(item.id, 'Verified')}
                  className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  ✓ Approve &amp; Sign-Off
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'Needs Review')}
                  className="py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-semibold text-xs border border-white/10 transition-colors"
                >
                  Send for Manual Review
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'Flagged')}
                  className="py-1.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold text-xs border border-rose-500/30 transition-colors"
                >
                  Flag / Dispute
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
