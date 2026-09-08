import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Minus, Plus, RotateCcw, Square } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getCaseById, type VerificationCase } from '../data/mockCases';

const FALLBACK = {
  id: 'BLR-2026-8819',
  docType: 'Sale Deed',
  district: 'Bengaluru Urban',
  taluk: 'Devanahalli',
  village: 'Binnamangala',
  surveyNo: '104/A',
  ownerName: 'Savitha M. Ranganath',
  extent: '2 Acres 14 Guntas',
} as VerificationCase;

interface Detection {
  id: string;
  kind: string;
  title: string;
  count: string;
  confidence: string;
  swatch: string;
  box: string;
  boxActive: string;
  bbox: { top: string; left: string; width: string; height: string };
}

const DETECTIONS: Detection[] = [
  {
    id: 'text',
    kind: 'Text',
    title: 'Conveyance declaration and party details',
    count: '12 regions',
    confidence: '98.4%',
    swatch: 'bg-det-text',
    box: 'border-det-text/60 bg-det-text/10',
    boxActive: 'border-det-text bg-det-text/20',
    bbox: { top: '16.6%', left: '5.2%', width: '89.6%', height: '16.2%' },
  },
  {
    id: 'table',
    kind: 'Table',
    title: 'Schedule of property and boundary extents',
    count: '2 tables',
    confidence: '97.9%',
    swatch: 'bg-det-table',
    box: 'border-det-table/60 bg-det-table/10',
    boxActive: 'border-det-table bg-det-table/20',
    bbox: { top: '32.4%', left: '5.2%', width: '89.6%', height: '16.5%' },
  },
  {
    id: 'signature',
    kind: 'Signature',
    title: 'Vendor and witness signature endorsement',
    count: '1 signature',
    confidence: '96.8%',
    swatch: 'bg-det-sign',
    box: 'border-det-sign/60 bg-det-sign/10',
    boxActive: 'border-det-sign bg-det-sign/20',
    bbox: { top: '68.6%', left: '67.9%', width: '27.2%', height: '9.4%' },
  },
  {
    id: 'stamp',
    kind: 'Stamp',
    title: 'Sub-Registrar official office stamp',
    count: '1 stamp',
    confidence: '98.2%',
    swatch: 'bg-det-stamp',
    box: 'border-det-stamp/60 bg-det-stamp/10',
    boxActive: 'border-det-stamp bg-det-stamp/20',
    bbox: { top: '62.4%', left: '5.2%', width: '23.6%', height: '15.4%' },
  },
];

export default function DedicatedAnalysisPage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId?: string }>();
  const current = getCaseById(caseId || 'BLR-2026-8819') || FALLBACK;

  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [overlays, setOverlays] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Document Analysis"
        subtitle={`${current.docType} · ${current.district} · ${current.taluk} · Survey ${current.surveyNo}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/verification')}>
              Back to Cases
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/verification/${current.id}`)}
              iconRight={<ArrowRight size={14} strokeWidth={2} />}
            >
              Continue to Verification
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ── Document viewer ── */}
        <div className="xl:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-panel px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant={overlays ? 'secondary' : 'ghost'}
                size="sm"
                icon={<Square size={13} strokeWidth={2} />}
                onClick={() => setOverlays((v) => !v)}
              >
                {overlays ? 'Detections on' : 'Detections off'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom(100)}>
                Fit page
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Zoom out"
                className="w-8 px-0"
                onClick={() => setZoom((z) => Math.max(60, z - 10))}
              >
                <Minus size={14} strokeWidth={2} />
              </Button>
              <span className="tnum w-11 text-center text-[12.5px] text-ink-2">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Zoom in"
                className="w-8 px-0"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
              >
                <Plus size={14} strokeWidth={2} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="tnum text-[12.5px] text-ink-3">Page {page} of 2</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 2}
                onClick={() => setPage((p) => Math.min(2, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex min-h-[560px] justify-center overflow-auto scrollbar-slim rounded-card border border-line bg-[#0f0f0f] p-6">
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="relative h-[720px] w-[520px] select-none rounded-[6px] bg-[#faf8f3] p-8 text-slate-900 transition-transform duration-150"
            >
              <div className="border-b border-slate-400 pb-4 text-center">
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                  Government of Karnataka · Department of Revenue
                </p>
                <h3 className="mt-1.5 font-serif text-[15px] font-bold text-slate-900">
                  Deed of Absolute Sale (ಶುದ್ಧ ಕ್ರಯಪತ್ರ)
                </h3>
                <p className="mt-1 text-[9.5px] text-slate-500">
                  Registration No. DEV/8819/2026 · Book 1 · Volume 418
                </p>
              </div>

              <div className="space-y-3 pt-4 font-serif text-[11px] leading-relaxed text-slate-800">
                <p>
                  THIS DEED OF ABSOLUTE SALE executed at Devanahalli Taluk on this 7th day of
                  September, 2026 by SRI BASAVARAJ K. GOWDA, son of Late K. Kempegowda, residing at
                  Binnamangala Village (hereinafter called the VENDOR).
                </p>
                <p>
                  IN FAVOUR OF SMT. SAVITHA M. RANGANATH, wife of Sri M. Ranganath Gowda, residing
                  at Bengaluru (hereinafter called the PURCHASER).
                </p>

                <div className="my-3 rounded border border-slate-300 bg-slate-100 p-2 font-sans text-[10px]">
                  <p className="mb-1 font-semibold text-slate-800">SCHEDULE OF PROPERTY</p>
                  <table className="w-full border-collapse text-left text-[9px]">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="py-1 font-semibold text-slate-600">Survey No.</td>
                        <td className="py-1 font-semibold">104/A</td>
                        <td className="py-1 font-semibold text-slate-600">Total Extent</td>
                        <td className="py-1">2 Acres 14 Guntas</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-1 font-semibold text-slate-600">Taluk / Village</td>
                        <td className="py-1">Devanahalli / Binnamangala</td>
                        <td className="py-1 font-semibold text-slate-600">Assessment</td>
                        <td className="py-1">₹ 140.00</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Boundaries</td>
                        <td colSpan={3} className="py-1">
                          East: Sy. 104/B · West: Road · North: Sy. 105 · South: Sy. 103
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  WHEREAS the Vendor is the absolute and undisputed titleholder of the agricultural
                  land described in the Schedule hereunder, and agrees to convey the same for an
                  agreed sale consideration of ₹ 45,00,000/- (Rupees Forty-Five Lakhs only).
                </p>

                <div className="flex items-end justify-between pt-8">
                  <div className="flex h-24 w-28 flex-col items-center justify-center rounded-full border-2 border-slate-500 p-1 text-center text-slate-600">
                    <span className="text-[7px] font-semibold">SUB-REGISTRAR</span>
                    <span className="text-[8px] font-bold">DEVANAHALLI</span>
                    <span className="text-[6px]">07 SEP 2026</span>
                    <span className="text-[7px] font-semibold">SEAL</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex h-8 w-32 items-center justify-center border-b border-slate-400 font-serif text-xs italic text-slate-700">
                      Basavaraj K. G.
                    </div>
                    <p className="font-sans text-[9px] font-semibold text-slate-600">
                      Signature of Vendor
                    </p>
                  </div>
                </div>
              </div>

              {overlays &&
                DETECTIONS.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    style={{ position: 'absolute', ...d.bbox }}
                    className={`cursor-pointer rounded-[3px] border-2 transition-colors ${
                      selected === d.id ? d.boxActive : d.box
                    }`}
                  >
                    <span className="absolute -top-[19px] left-0 rounded-[4px] bg-[#0f0f0f] px-1.5 py-[2px] text-[10px] font-medium text-ink-2">
                      {d.kind}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── Analysis panel ── */}
        <div className="xl:col-span-4 space-y-5">
          <Panel
            title="Detected Elements"
            subtitle="Select an element to highlight it on the document."
          >
            <div className="space-y-2.5">
              {DETECTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelected(selected === d.id ? null : d.id)}
                  className={`w-full rounded-ctl border p-3.5 text-left transition-colors ${
                    selected === d.id
                      ? 'border-line-strong bg-raised-2'
                      : 'border-line bg-raised hover:bg-raised-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <span className={`h-2 w-2 rounded-full ${d.swatch}`} />
                      {d.kind} Detection
                    </span>
                    <span className="tnum text-[12px] text-ink-2">{d.confidence}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-ink-3 leading-snug">{d.title}</p>
                  <p className="mt-1.5 text-[11.5px] text-ink-3">{d.count} · Verified by system</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Analysis Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Document quality</span>
                <Badge tone="ok">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Review status</span>
                <Badge tone="warn">Ready for review</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Inconsistencies</span>
                <span className="text-[12.5px] text-ink">None detected</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-line pt-4">
              <Button
                variant="primary"
                block
                onClick={() => navigate(`/verification/${current.id}`)}
                iconRight={<ArrowRight size={15} strokeWidth={2} />}
              >
                Continue to Verification
              </Button>
              <Button
                variant="secondary"
                block
                icon={<RotateCcw size={14} strokeWidth={2} />}
                onClick={() => navigate('/processing')}
              >
                Re-run Analysis
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
