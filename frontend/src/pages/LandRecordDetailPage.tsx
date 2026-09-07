import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById } from '../data/mockRecords';

export default function LandRecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  const record = getRecordById(recordId || 'REC-KA-BLR-104A');
  const [activeTab, setActiveTab] = useState<'Overview' | 'Documents' | 'Ownership History' | 'Verification History'>('Overview');

  if (!record) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Record Not Found</h2>
        <p className="text-sm text-[#94A39B]">The requested land record ID does not exist in the archive.</p>
        <button
          onClick={() => navigate('/land-records')}
          className="py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-medium"
        >
          Return to Land Records
        </button>
      </div>
    );
  }

  const tabs: Array<'Overview' | 'Documents' | 'Ownership History' | 'Verification History'> = [
    'Overview',
    'Documents',
    'Ownership History',
    'Verification History',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('/land-records')}
              className="text-xs text-[#94A39B] hover:text-white transition-colors"
            >
              Land Records Archive
            </button>
            <span className="text-xs text-[#64756D]">/</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">{record.recordId}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Cadastral Parcel: Survey No. {record.surveyNo}
          </h1>
          <p className="text-xs text-[#94A39B] mt-0.5">
            {record.village} Village · {record.taluk} Taluk · {record.district}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/land-records')}
            className="py-2 px-3.5 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            ← Back to Archive
          </button>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            {record.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 rounded-xl text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#161E1B] text-white border border-emerald-500/30 font-semibold'
                : 'text-[#94A39B] hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-5">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
              Cadastral Title Overview
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#94A39B]">Registered Owner</p>
                <p className="text-sm font-semibold text-white mt-1">{record.ownerName}</p>
                <p className="text-[11px] text-[#64756D]">Relation: {record.fatherOrHusbandName}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Survey Number</p>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-1">Sy. {record.surveyNo}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Land Extent / Area</p>
                <p className="text-sm font-semibold text-white mt-1">{record.landArea}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Village &amp; Taluk</p>
                <p className="font-medium text-white mt-1">{record.village}, {record.taluk}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">District</p>
                <p className="font-medium text-white mt-1">{record.district}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Record Type</p>
                <p className="font-medium text-white mt-1">{record.recordType}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Soil Classification</p>
                <p className="font-medium text-white mt-1">{record.soilClassification}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Annual Assessment Tax</p>
                <p className="font-medium text-white mt-1">{record.annualTax}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">GPS Centroid Coordinates</p>
                <p className="font-mono text-emerald-300 mt-1">{record.gpsCentroid}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
              Verification Status
            </h2>
            <div className="p-4 rounded-xl bg-[#0F1513] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A39B]">Status:</span>
                <span className="font-semibold text-emerald-400">{record.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A39B]">Last Re-verification:</span>
                <span className="text-slate-200">{record.lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A39B]">Digital Certificate:</span>
                <span className="font-mono text-cyan-400">SHA-256 Valid</span>
              </div>
            </div>
            <button
              onClick={() => alert(`Official extract generated for Survey No. ${record.surveyNo}`)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
            >
              Export RoR Extract (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'Documents' && (
        <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
          <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
            Linked Official Instruments &amp; Deeds
          </h2>
          <div className="space-y-3">
            {record.documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0F1513] border border-white/[0.06] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{doc.title}</p>
                  <p className="text-[11px] text-[#94A39B] mt-0.5">
                    Category: {doc.type} · Registered Date: {doc.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${doc.verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {doc.verified ? 'Verified Document' : 'Pending Sign-off'}
                  </span>
                  <button
                    onClick={() => navigate('/analysis')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Ownership History (Vertical Timeline) */}
      {activeTab === 'Ownership History' && (
        <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-6">
          <div>
            <h2 className="text-base font-semibold text-white">Title Succession &amp; Mutation History</h2>
            <p className="text-xs text-[#94A39B] mt-0.5">
              Chronological title transactions recorded in state land revenue archives.
            </p>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30">
            {record.ownershipHistory.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#161E1B]" />
                <div className="p-4 rounded-xl bg-[#0F1513] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">{item.year}</span>
                    <span className="text-[11px] text-[#94A39B] font-mono">{item.documentRef}</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{item.type}</p>
                  <p className="text-xs text-[#94A39B] leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-slate-300 pt-1">
                    <strong className="text-slate-400">Parties:</strong> {item.parties}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Verification History */}
      {activeTab === 'Verification History' && (
        <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
          <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
            Audit &amp; Officer Sign-Off Logs
          </h2>
          <div className="space-y-3">
            {record.verificationHistory.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0F1513] border border-white/[0.06] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{v.outcome}</span>
                  <span className="text-[#94A39B] font-mono text-[11px]">{v.date}</span>
                </div>
                <p className="text-[#94A39B]">Officer: <span className="text-slate-200">{v.officer}</span></p>
                <p className="text-slate-300 pt-1 border-t border-white/[0.04]">{v.remarks}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
