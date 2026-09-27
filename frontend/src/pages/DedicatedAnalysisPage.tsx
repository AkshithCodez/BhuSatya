import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Square, Loader2, AlertCircle, FileSearch, Upload } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getDocument, getDetections, getRegions, getPageImageUrl } from '../api/client';
import type { Detection, Region, DocumentOut } from '../types';

export default function DedicatedAnalysisPage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId?: string }>();
  const [searchParams] = useSearchParams();

  // Determine if viewing an uploaded DB document
  const docIdParam = searchParams.get('docId') || (caseId && /^\d+$/.test(caseId) ? caseId : null) || sessionStorage.getItem('currentDocId');
  const numericDocId = docIdParam && !isNaN(Number(docIdParam)) ? Number(docIdParam) : null;

  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [overlays, setOverlays] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Real DB state
  const [dbDocument, setDbDocument] = useState<DocumentOut | null>(null);
  const [dbDetections, setDbDetections] = useState<Detection[]>([]);
  const [dbRegions, setDbRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(numericDocId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numericDocId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getDocument(numericDocId).catch((err) => {
        throw new Error(err?.response?.data?.detail || 'Document not found in PostgreSQL');
      }),
      getDetections(numericDocId).catch(() => []),
      getRegions(numericDocId).catch(() => []),
    ])
      .then(([doc, detections, regions]) => {
        if (!isMounted) return;
        setDbDocument(doc);
        setPageCount(doc.page_count || 1);
        setDbDetections(Array.isArray(detections) ? detections : []);
        setDbRegions(Array.isArray(regions) ? regions : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load document from backend');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [numericDocId]);

  const getStyleForClass = (className: string, isSelected: boolean) => {
    const c = className.toLowerCase();
    if (c === 'table') {
      return {
        swatch: 'bg-emerald-400',
        label: 'Table Region',
        borderColor: isSelected ? 'border-emerald-400 bg-emerald-400/25 ring-2 ring-emerald-400' : 'border-emerald-400/80 bg-emerald-400/15',
        badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-700/50',
      };
    }
    if (c === 'signature') {
      return {
        swatch: 'bg-sky-400',
        label: 'Signature Region',
        borderColor: isSelected ? 'border-sky-400 bg-sky-400/25 ring-2 ring-sky-400' : 'border-sky-400/80 bg-sky-400/15',
        badgeColor: 'bg-sky-950 text-sky-300 border border-sky-700/50',
      };
    }
    // stamp
    return {
      swatch: 'bg-amber-400',
      label: 'Stamp Region',
      borderColor: isSelected ? 'border-amber-400 bg-amber-400/25 ring-2 ring-amber-400' : 'border-amber-400/80 bg-amber-400/15',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-700/50',
    };
  };

  const subtitle = dbDocument
    ? `${dbDocument.original_filename} · ID #${dbDocument.id} · Status: ${dbDocument.status} · PostgreSQL`
    : 'Inspect layout detections and extracted evidentiary regions.';

  return (
    <>
      <PageHeader
        title="Document Analysis"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/verification')}>
              Back to Cases
            </Button>
            {numericDocId && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/verification/${numericDocId}`)}
                iconRight={<ArrowRight size={14} strokeWidth={2} />}
              >
                Continue to Verification
              </Button>
            )}
          </>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!numericDocId ? (
        <Panel className="p-12 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <span className="mx-auto grid place-items-center h-12 w-12 rounded-full bg-raised text-ink-3">
              <FileSearch size={24} />
            </span>
            <h2 className="text-base font-medium text-ink">No Document Selected for Analysis</h2>
            <p className="text-xs text-ink-3 leading-relaxed">
              To inspect layout detections (tables, stamps, signatures) and table crops, please upload a scanned document or select an existing document record.
            </p>
            <div className="pt-3 flex justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={<Upload size={14} />}
                onClick={() => navigate('/upload')}
              >
                Upload Document
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
              >
                Go to Overview
              </Button>
            </div>
          </div>
        </Panel>
      ) : (
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
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="tnum text-[12.5px] text-ink-3">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="flex min-h-[580px] justify-center overflow-auto scrollbar-slim rounded-card border border-line bg-[#0f0f0f] p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-ink-3">
                  <Loader2 className="animate-spin text-accent mb-3" size={28} />
                  <p className="text-sm">Loading document & detections from database...</p>
                </div>
              ) : dbDocument ? (
                <div
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  className="relative inline-block select-none shadow-2xl transition-transform duration-150"
                >
                  <img
                    src={getPageImageUrl(numericDocId, page)}
                    alt={`Document Page ${page}`}
                    className="max-w-[720px] w-auto h-auto rounded-[4px] block border border-line-strong"
                  />

                  {overlays &&
                    dbDetections.map((det) => {
                      const isSelected = selectedId === det.id;
                      const style = getStyleForClass(det.class_name, isSelected);

                      const left = `${(det.bbox.x1 / det.image_width) * 100}%`;
                      const top = `${(det.bbox.y1 / det.image_height) * 100}%`;
                      const width = `${((det.bbox.x2 - det.bbox.x1) / det.image_width) * 100}%`;
                      const height = `${((det.bbox.y2 - det.bbox.y1) / det.image_height) * 100}%`;

                      return (
                        <div
                          key={det.id}
                          onClick={() => setSelectedId(isSelected ? null : det.id)}
                          style={{
                            position: 'absolute',
                            left,
                            top,
                            width,
                            height,
                          }}
                          className={`cursor-pointer rounded-[3px] border-2 transition-all ${style.borderColor}`}
                        >
                          <span
                            className={`absolute -top-6 left-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium shadow ${style.badgeColor}`}
                          >
                            {det.class_name.toUpperCase()} {(det.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-ink-3">
                  <p className="text-sm">Document page image unavailable.</p>
                </div>
              )}
            </div>

            {dbDetections.length === 0 && !loading && (
              <div className="flex items-center gap-2 rounded-card border border-line bg-panel px-4 py-3 text-xs text-ink-3">
                <AlertCircle size={15} className="shrink-0 text-amber-400" />
                <span>
                  No layout detections recorded for this document. If YOLO weights are missing, place <code>layout_detector.pt</code> in <code>backend/ml_models/</code> and run detection.
                </span>
              </div>
            )}
          </div>

          {/* ── Analysis panel ── */}
          <div className="xl:col-span-4 space-y-5">
            <Panel
              title="Detected Elements (PostgreSQL)"
              subtitle="Extracted via real YOLOv8n and saved with boundary coordinates."
            >
              <div className="space-y-2.5">
                {dbDetections.length > 0 ? (
                  dbDetections.map((d) => {
                    const isSelected = selectedId === d.id;
                    const style = getStyleForClass(d.class_name, isSelected);
                    const cropRegion = dbRegions.find(
                      (r) => r.detection_id === Number(d.id.replace('det_', '')) || r.class_name === d.class_name
                    );

                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedId(isSelected ? null : d.id)}
                        className={`w-full rounded-ctl border p-3 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-line-strong bg-raised-2'
                            : 'border-line bg-raised hover:bg-raised-2'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                            <span className={`h-2.5 w-2.5 rounded-full ${style.swatch}`} />
                            {style.label}
                          </span>
                          <span className="tnum font-mono text-[12px] text-accent-hi">
                            {(d.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] text-ink-3">
                          ID: {d.id} · Box: [{Math.round(d.bbox.x1)}, {Math.round(d.bbox.y1)}] to [{Math.round(d.bbox.x2)}, {Math.round(d.bbox.y2)}]
                        </p>
                        {cropRegion && (
                          <div className="mt-2 flex items-center gap-2 border-t border-line/50 pt-2 text-[11px] text-ink-3">
                            <span className="text-accent-hi font-medium">Cropped region saved</span>
                            <span className="text-ink-4">
                              ({cropRegion.crop_width}x{cropRegion.crop_height}px)
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-ink-3 py-4 text-center">
                    No layout elements detected. Real YOLO model required.
                  </p>
                )}
              </div>
            </Panel>

            <Panel title="Analysis Summary">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-3">Document status</span>
                  <Badge tone={dbDocument?.status === 'VERIFIED' ? 'ok' : 'accent'}>
                    {dbDocument?.status || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-3">Persistence</span>
                  <Badge tone="accent">PostgreSQL Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-3">Elements Detected</span>
                  <span className="text-[12.5px] font-mono text-ink">
                    {dbDetections.length} regions
                  </span>
                </div>
                {dbRegions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-ink-3">Cropped Regions</span>
                    <span className="text-[12.5px] font-mono text-accent-hi">
                      {dbRegions.length} crops saved
                    </span>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
