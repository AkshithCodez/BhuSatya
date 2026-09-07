import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowTimelinePanel from '../components/dashboard/WorkflowTimelinePanel';

export default function DedicatedAnalysisPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'table' | 'text' | 'stamp' | 'signature'>('all');
  const [selectedElement, setSelectedElement] = useState<string | null>('table-1');

  const detections = [
    {
      id: 'table-1',
      category: 'table',
      name: 'Schedule of Property Table',
      confidence: '99.2%',
      bbox: { top: '18%', left: '15%', width: '70%', height: '32%' },
      color: 'border-emerald-400 bg-emerald-500/15 text-emerald-300',
      tag: 'Table Detection',
      data: {
        'Survey Number': '104/A',
        'Total Extent': '2 Acres 14 Guntas',
        'Assessment Tax': '₹ 140.00 / annum',
        'Land Classification': 'Dry Agricultural (Bagayat)',
      },
    },
    {
      id: 'text-1',
      category: 'text',
      name: 'Bilingual Deed Text (Grantor / Grantee)',
      confidence: '98.4%',
      bbox: { top: '53%', left: '15%', width: '70%', height: '20%' },
      color: 'border-cyan-400 bg-cyan-500/15 text-cyan-300',
      tag: 'Text Detection',
      data: {
        'Vendor Name': 'Basavaraj K. Gowda',
        'Purchaser Name': 'Savitha M. Ranganath',
        'Consideration Amount': '₹ 45,00,000 /-',
        'Execution Date': '07-September-2026',
      },
    },
    {
      id: 'stamp-1',
      category: 'stamp',
      name: 'Sub-Registrar Official Jurisdictional Seal',
      confidence: '99.5%',
      bbox: { top: '76%', left: '18%', width: '28%', height: '18%' },
      color: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
      tag: 'Stamp Detection',
      data: {
        'Seal Office': 'Senior Sub-Registrar, Devanahalli',
        'Jurisdiction Code': 'KA-BLR-DEV-04',
        'Verification Status': 'Authentic Sovereign Seal',
      },
    },
    {
      id: 'sig-1',
      category: 'signature',
      name: 'Executive Officer Endorsement',
      confidence: '98.7%',
      bbox: { top: '76%', left: '55%', width: '30%', height: '18%' },
      color: 'border-amber-400 bg-amber-500/20 text-amber-300',
      tag: 'Signature Detection',
      data: {
        'Endorsed By': 'Authorized Revenue Officer',
        'Sign Integrity': 'High Stroke Fidelity',
        'Timestamp Verified': '2026-09-07 16:42:19 IST',
      },
    },
  ];

  const currentDet = detections.find((d) => d.id === selectedElement) || detections[0];

  return (
    <div className="space-y-6 select-none">
      {/* ─── Page Header & Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              AI Document Analysis
            </span>
            <span className="text-xs text-slate-500 font-mono">CASE #BLR-2026-8819</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sale Deed Verification &amp; Element Segmentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Devanahalli Taluk · Survey No. 104/A · Ingested Today 10:24 AM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/verification')}
            className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
          >
            ← View Case Queue
          </button>
          <button
            onClick={() => {
              alert('Case #BLR-2026-8819 forwarded to Officer Sign-Off.');
              navigate('/verification');
            }}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07130b] text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            Forward to Adjudication →
          </button>
        </div>
      </div>

      {/* ─── Detection Category Toggles ─── */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Detections (4)' },
            { id: 'table', label: 'Table Detection' },
            { id: 'text', label: 'Text Detection' },
            { id: 'stamp', label: 'Stamp Detection' },
            { id: 'signature', label: 'Signature Detection' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeFilter === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-emerald-400 shrink-0 hidden md:block">
          Overall Detection Confidence: <strong>99.1%</strong>
        </div>
      </div>

      {/* ─── Two-Column Document Canvas & Inspector ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Document Canvas with Interactive Bounding Boxes */}
        <div className="lg:col-span-7 rounded-2xl bg-[#11161d] border border-white/[0.08] p-4 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-lg aspect-[1/1.3] bg-[#0b0e12] rounded-xl border border-white/10 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
            {/* Simulated Document Header */}
            <div className="border-b border-white/10 pb-3 text-center">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                GOVERNMENT OF KARNATAKA · DEPARTMENT OF STAMPS &amp; REGISTRATION
              </span>
              <h4 className="text-sm font-bold text-slate-200 mt-1">FORM NO. 1 — SALE DEED REGISTER</h4>
            </div>

            {/* Bounding Box Overlays */}
            {detections.map((det) => {
              const isVisible = activeFilter === 'all' || activeFilter === det.category;
              const isSelected = selectedElement === det.id;
              if (!isVisible) return null;

              return (
                <div
                  key={det.id}
                  onClick={() => setSelectedElement(det.id)}
                  className={`absolute rounded-lg border-2 transition-all cursor-pointer p-2 flex flex-col justify-between ${
                    det.color
                  } ${
                    isSelected
                      ? 'ring-2 ring-white shadow-xl scale-[1.01]'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    top: det.bbox.top,
                    left: det.bbox.left,
                    width: det.bbox.width,
                    height: det.bbox.height,
                  }}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                    <span>{det.tag}</span>
                    <span>{det.confidence}</span>
                  </div>
                  <span className="text-[9px] font-semibold truncate mt-auto">
                    {det.name}
                  </span>
                </div>
              );
            })}

            {/* Document Bottom Footer */}
            <div className="border-t border-white/10 pt-2 flex justify-between text-[9px] font-mono text-slate-500">
              <span>PAGE 1 OF 3</span>
              <span>SHA-256: 8f3c4e...92a1</span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Element Data Inspector Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400">Selected Element</span>
                <h3 className="text-base font-semibold text-white tracking-tight">{currentDet.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {currentDet.confidence}
              </span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(currentDet.data).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{key}:</span>
                  <span className="text-slate-100 font-semibold text-right">{val}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex gap-2">
              <button
                onClick={() => alert(`Marked ${currentDet.name} as Verified.`)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-semibold text-xs border border-emerald-500/30 transition-colors"
              >
                ✓ Confirm Element
              </button>
              <button
                onClick={() => alert(`Flagged ${currentDet.name} for manual surveyor review.`)}
                className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold text-xs border border-rose-500/30 transition-colors"
              >
                Flag Anomaly
              </button>
            </div>
          </div>

          {/* Verification Rules Checklist */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-200">Legal Adjudication Notes:</h4>
            <p>• The officer must verify that the survey number matches the Pahani register.</p>
            <p>• AI detection highlights boundaries for evidentiary review. Final adjudication remains officer prerogative.</p>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Interactive Multi-lane AI Pipeline Visualizer ─── */}
      <section className="pt-2">
        <WorkflowTimelinePanel />
      </section>
    </div>
  );
}
