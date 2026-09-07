import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCaseById } from '../data/mockCases';

export default function DedicatedAnalysisPage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId?: string }>();

  // Determine current case or default to BLR-2026-8819
  const currentCase = getCaseById(caseId || 'BLR-2026-8819') || {
    id: 'BLR-2026-8819',
    docType: 'Sale Deed',
    district: 'Bengaluru Urban',
    taluk: 'Devanahalli',
    village: 'Binnamangala',
    surveyNo: '104/A',
    ownerName: 'Savitha M. Ranganath',
    extent: '2 Acres 14 Guntas',
  };

  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOverlays, setShowOverlays] = useState(true);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);

  const detectionBoxes = [
    {
      id: 'table-1',
      category: 'TABLE',
      label: 'TABLE 97.9%',
      confidence: '97.9%',
      color: 'border-emerald-500/70 bg-emerald-500/10 text-emerald-300',
      activeColor: 'border-emerald-400 bg-emerald-500/20 ring-1 ring-emerald-400',
      bbox: { top: '22%', left: '12%', width: '76%', height: '28%' },
      title: 'Schedule of Property & Boundary Extents',
    },
    {
      id: 'text-1',
      category: 'TEXT',
      label: 'TEXT 98.4%',
      confidence: '98.4%',
      color: 'border-cyan-500/70 bg-cyan-500/10 text-cyan-300',
      activeColor: 'border-cyan-400 bg-cyan-500/20 ring-1 ring-cyan-400',
      bbox: { top: '53%', left: '12%', width: '76%', height: '18%' },
      title: 'Conveyance Declaration & Consideration Clause',
    },
    {
      id: 'stamp-1',
      category: 'STAMP',
      label: 'STAMP 98.2%',
      confidence: '98.2%',
      color: 'border-purple-500/70 bg-purple-500/10 text-purple-300',
      activeColor: 'border-purple-400 bg-purple-500/20 ring-1 ring-purple-400',
      bbox: { top: '74%', left: '15%', width: '28%', height: '19%' },
      title: 'Sub-Registrar Official Office Stamp',
    },
    {
      id: 'sig-1',
      category: 'SIGNATURE',
      label: 'SIGNATURE 96.8%',
      confidence: '96.8%',
      color: 'border-amber-500/70 bg-amber-500/10 text-amber-300',
      activeColor: 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400',
      bbox: { top: '74%', left: '55%', width: '32%', height: '19%' },
      title: 'Vendor & Witness Signature Endorsement',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Top Bar with Case Context & Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400 font-medium">
              {currentCase.id}
            </span>
            <span className="text-xs text-[#94A39B]">·</span>
            <span className="text-xs text-[#94A39B]">
              {currentCase.district} · {currentCase.taluk} · Sy. {currentCase.surveyNo}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {currentCase.docType} Analysis
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/verification')}
            className="py-2 px-3.5 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            ← Back to Cases
          </button>
          <button
            onClick={() => navigate(`/verification/${currentCase.id}`)}
            className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Continue to Verification</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ─── Main 2-Column Workspace (65% Left / 35% Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ═══════════════════════════════════════════
            LEFT: DOCUMENT VIEWER (~65%, 8 cols)
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-3">
          {/* Viewer Toolbar */}
          <div className="p-3 rounded-xl bg-[#161E1B] border border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  showOverlays
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/[0.04] text-[#94A39B] border-white/[0.06] hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M3 9h18" />
                </svg>
                <span>{showOverlays ? 'Overlays On' : 'Overlays Off'}</span>
              </button>

              <button
                onClick={() => setZoomLevel(100)}
                className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
              >
                Fit Page
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A39B] hover:text-white text-xs border border-white/[0.06] flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="text-xs text-[#94A39B] w-12 text-center font-mono">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A39B] hover:text-white text-xs border border-white/[0.06] flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-[#94A39B]">Page {currentPage} of 2</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
                disabled={currentPage === 2}
                className="py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Scanned Document Canvas */}
          <div className="rounded-2xl bg-[#0A0E0D] border border-white/[0.08] p-6 flex justify-center overflow-auto min-h-[560px]">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-[520px] h-[720px] bg-[#fbf9f4] text-slate-900 rounded-lg shadow-2xl relative p-8 select-none transition-transform duration-150"
            >
              {/* Document Visual Content */}
              <div className="text-center pb-4 border-b-2 border-slate-400/80">
                <p className="text-[10px] font-serif tracking-widest text-slate-600 uppercase">
                  GOVERNMENT OF KARNATAKA · DEPARTMENT OF REVENUE
                </p>
                <h3 className="text-base font-serif font-bold text-slate-900 mt-1">
                  DEED OF ABSOLUTE SALE (ಶುದ್ಧ ಕ್ರಯಪತ್ರ)
                </h3>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                  Registration No: DEV/8819/2026 · Book 1 · Volume 418
                </p>
              </div>

              <div className="pt-4 space-y-3 text-[11px] text-slate-800 leading-relaxed font-serif">
                <p>
                  THIS DEED OF ABSOLUTE SALE executed at Devanahalli Taluk on this 7th day of
                  September, 2026 by SRI BASAVARAJ K. GOWDA, son of Late K. Kempegowda, residing at
                  Binnamangala Village (hereinafter called the VENDOR).
                </p>
                <p>
                  IN FAVOUR OF SMT. SAVITHA M. RANGANATH, wife of Sri M. Ranganath Gowda, residing at
                  Bengaluru (hereinafter called the PURCHASER).
                </p>

                {/* Simulated Property Schedule Table */}
                <div className="my-3 p-2 bg-slate-100 rounded border border-slate-300 font-sans text-[10px]">
                  <p className="font-bold text-slate-800 mb-1">SCHEDULE OF PROPERTY</p>
                  <table className="w-full text-left border-collapse text-[9px]">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="py-1 font-semibold text-slate-700">Survey No:</td>
                        <td className="py-1 font-mono font-bold">104/A</td>
                        <td className="py-1 font-semibold text-slate-700">Total Extent:</td>
                        <td className="py-1">2 Acres 14 Guntas</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1 font-semibold text-slate-700">Taluk / Village:</td>
                        <td className="py-1">Devanahalli / Binnamangala</td>
                        <td className="py-1 font-semibold text-slate-700">Assessment:</td>
                        <td className="py-1">₹ 140.00</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-700">Boundaries:</td>
                        <td colSpan={3} className="py-1">
                          East: Sy. 104/B · West: Road · North: Sy. 105 · South: Sy. 103
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  WHEREAS the Vendor is the absolute and undisputed titleholder of the agricultural land
                  described in the Schedule hereunder, and agrees to convey the same for an agreed sale
                  consideration of ₹ 45,00,000/- (Rupees Forty-Five Lakhs only).
                </p>

                {/* Simulated Stamp and Signatures */}
                <div className="pt-8 flex items-end justify-between">
                  <div className="w-28 h-24 border-2 border-purple-800 rounded-full flex flex-col items-center justify-center text-center p-1 text-purple-900 opacity-90">
                    <span className="text-[7px] font-bold">SUB-REGISTRAR</span>
                    <span className="text-[8px] font-black">DEVANAHALLI</span>
                    <span className="text-[6px]">07 SEP 2026</span>
                    <span className="text-[7px] font-bold">SEAL</span>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="w-32 h-8 border-b border-slate-400 flex items-center justify-center italic text-xs text-blue-900 font-serif">
                      Basavaraj K. G.
                    </div>
                    <p className="text-[9px] font-sans font-bold text-slate-700">
                      Signature of Vendor
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── Detection Bounding Boxes ─── */}
              {showOverlays &&
                detectionBoxes.map((box) => {
                  const isSelected = selectedOverlay === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedOverlay(box.id)}
                      style={{
                        position: 'absolute',
                        top: box.bbox.top,
                        left: box.bbox.left,
                        width: box.bbox.width,
                        height: box.bbox.height,
                      }}
                      className={`rounded border-2 transition-all cursor-pointer ${
                        isSelected ? box.activeColor : box.color
                      }`}
                    >
                      <span className="absolute -top-5 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0A0E0D]/90 text-white border border-white/20 shadow-md">
                        {box.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT: ANALYSIS PANEL (~35%, 4 cols)
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">
                AI-Assisted Document Analysis
              </h2>
              <p className="text-xs text-[#94A39B] mt-1 leading-relaxed">
                AI-assisted analysis is complete. Detected document elements are ready for officer review.
              </p>
            </div>

            {/* 4 Detection Capability Summaries */}
            <div className="space-y-3 pt-2">
              {/* Text Detection */}
              <div className="p-3.5 rounded-xl bg-[#0F1513] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Text Detection</p>
                  <p className="text-[11px] text-[#94A39B] mt-0.5">Detected regions: 12</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  98.4%
                </span>
              </div>

              {/* Table Detection */}
              <div className="p-3.5 rounded-xl bg-[#0F1513] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Table Detection</p>
                    <p className="text-[11px] text-[#94A39B] mt-0.5">Detected tables: 2</p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    97.9%
                  </span>
                </div>
                <p className="text-[10px] text-[#64756D] italic pt-1 border-t border-white/[0.04]">
                  Table detected successfully. Structured table extraction: Preview unavailable / pending integration.
                </p>
              </div>

              {/* Signature Detection */}
              <div className="p-3.5 rounded-xl bg-[#0F1513] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Signature Detection</p>
                  <p className="text-[11px] text-[#94A39B] mt-0.5">Detected: 1</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  96.8%
                </span>
              </div>

              {/* Stamp Detection */}
              <div className="p-3.5 rounded-xl bg-[#0F1513] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Stamp Detection</p>
                  <p className="text-[11px] text-[#94A39B] mt-0.5">Detected: 1</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  98.2%
                </span>
              </div>
            </div>

            {/* Quality & Status Indicator Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0F1513] border border-white/[0.06]">
                <p className="text-[11px] text-[#94A39B]">Document Quality</p>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">Good</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1513] border border-white/[0.06]">
                <p className="text-[11px] text-[#94A39B]">Review Status</p>
                <p className="text-xs font-semibold text-slate-200 mt-1">Ready for Officer Review</p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-3">
              <button
                onClick={() => navigate(`/verification/${currentCase.id}`)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue to Verification</span>
                <span>→</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/processing')}
                  className="py-2 px-3 rounded-xl bg-[#0F1513] hover:bg-[#1E2824] text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
                >
                  Re-run Analysis
                </button>
                <button
                  onClick={() => alert(`Summary exported for Case #${currentCase.id}`)}
                  className="py-2 px-3 rounded-xl bg-[#0F1513] hover:bg-[#1E2824] text-xs text-[#94A39B] hover:text-white border border-white/[0.06] transition-colors"
                >
                  Download Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
