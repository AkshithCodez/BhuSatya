import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Minus, Plus, Square, Loader2, AlertCircle, FileSearch,
  Upload, MousePointer, CheckCircle, RefreshCw, Scissors, Sparkles
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  getDocument, getDetections, getRegions, getPageImageUrl,
  createManualRegion, extractTable, parseFields, getRegionImageUrl,
  detectLayout
} from '../api/client';
import type { Detection, Region, DocumentOut } from '../types';

interface DrawRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

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
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  // Real DB state
  const [dbDocument, setDbDocument] = useState<DocumentOut | null>(null);
  const [dbDetections, setDbDetections] = useState<Detection[]>([]);
  const [dbRegions, setDbRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(numericDocId));
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual Selection State
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null);
  const [finalBox, setFinalBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [processingManual, setProcessingManual] = useState<boolean>(false);
  const [processingYOLO, setProcessingYOLO] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<'regions' | 'raw_detections'>('regions');

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRunYOLODetection = async () => {
    if (!numericDocId) return;
    setProcessingYOLO(true);
    setStatusMessage('Running two-model YOLO detection (Model A: Layout + Model B: Document Elements)...');
    setError(null);
    try {
      await detectLayout(numericDocId);
      setStatusMessage('Two-model detection completed! Detections normalized, tables deduplicated, and crops created.');
      fetchDocumentData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'YOLO detection failed');
    } finally {
      setProcessingYOLO(false);
    }
  };


  const fetchDocumentData = () => {
    if (!numericDocId) return;
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
        setDbDocument(doc);
        setPageCount(doc.page_count || 1);
        setDbDetections(Array.isArray(detections) ? detections : []);
        setDbRegions(Array.isArray(regions) ? regions : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load document from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocumentData();
  }, [numericDocId]);

  // Handle Manual Selection Mouse Events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isManualMode || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setIsDrawing(true);
    setDrawRect({ startX: x, startY: y, currentX: x, currentY: y });
    setFinalBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setDrawRect((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !drawRect || !imgRef.current) return;
    setIsDrawing(false);

    const rect = imgRef.current.getBoundingClientRect();
    const naturalW = imgRef.current.naturalWidth || 800;
    const naturalH = imgRef.current.naturalHeight || 1000;
    const scaleX = naturalW / rect.width;
    const scaleY = naturalH / rect.height;

    const x1 = Math.min(drawRect.startX, drawRect.currentX) * scaleX;
    const y1 = Math.min(drawRect.startY, drawRect.currentY) * scaleY;
    const x2 = Math.max(drawRect.startX, drawRect.currentX) * scaleX;
    const y2 = Math.max(drawRect.startY, drawRect.currentY) * scaleY;

    if (Math.abs(x2 - x1) >= 10 && Math.abs(y2 - y1) >= 10) {
      setFinalBox({ x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2) });
    } else {
      setFinalBox(null);
      setDrawRect(null);
    }
  };

  const handleSaveAndExtractManual = async () => {
    if (!numericDocId || !finalBox || !imgRef.current) return;

    setProcessingManual(true);
    setStatusMessage('Saving manual table region and cropping...');
    setError(null);

    const naturalW = imgRef.current.naturalWidth || 800;
    const naturalH = imgRef.current.naturalHeight || 1000;

    try {
      // 1. Create Manual Region in PostgreSQL
      const region = await createManualRegion(numericDocId, {
        page_number: page,
        x1: finalBox.x1,
        y1: finalBox.y1,
        x2: finalBox.x2,
        y2: finalBox.y2,
        image_width: naturalW,
        image_height: naturalH,
        region_type: 'table',
      });

      setStatusMessage('Executing real PaddleOCR on cropped table region...');

      // 2. Run real PaddleOCR on the crop
      await extractTable(region.id);

      setStatusMessage('Parsing structured fields from OCR output...');

      // 3. Parse fields into extracted_fields table
      await parseFields(numericDocId);

      setStatusMessage('Manual table extracted & structured fields populated successfully!');
      setFinalBox(null);
      setDrawRect(null);
      setIsManualMode(false);
      fetchDocumentData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Manual extraction failed');
    } finally {
      setProcessingManual(false);
    }
  };

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
    return {
      swatch: 'bg-amber-400',
      label: 'Stamp Region',
      borderColor: isSelected ? 'border-amber-400 bg-amber-400/25 ring-2 ring-amber-400' : 'border-amber-400/80 bg-amber-400/15',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-700/50',
    };
  };

  const subtitle = dbDocument
    ? `${dbDocument.original_filename} · ID #${dbDocument.id} · Status: ${dbDocument.status} · PostgreSQL`
    : 'Inspect layout detections and select manual table regions.';

  return (
    <>
      <PageHeader
        title="Document Analysis & Table Region Selection"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/verification')}>
              Back to Cases
            </Button>
            {numericDocId && (
              <Button
                variant="secondary"
                size="sm"
                disabled={processingYOLO}
                onClick={handleRunYOLODetection}
                icon={processingYOLO ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              >
                {processingYOLO ? 'Detecting...' : 'Run YOLO Detection'}
              </Button>
            )}
            {numericDocId && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/verification/${numericDocId}`)}
                iconRight={<ArrowRight size={14} strokeWidth={2} />}
              >
                Continue to Review
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

      {statusMessage && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle size={16} className="shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
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
              Upload a scanned document to view pages, manually draw table regions, or inspect detected layout structures.
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
                  variant={isManualMode ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<Scissors size={13} strokeWidth={2} />}
                  onClick={() => {
                    setIsManualMode(!isManualMode);
                    setFinalBox(null);
                    setDrawRect(null);
                  }}
                >
                  {isManualMode ? 'Exit Selection Mode' : 'Select Table Region'}
                </Button>
                <Button
                  variant={overlays ? 'secondary' : 'ghost'}
                  size="sm"
                  icon={<Square size={13} strokeWidth={2} />}
                  onClick={() => setOverlays((v) => !v)}
                >
                  {overlays ? 'Boxes On' : 'Boxes Off'}
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

            {/* Manual Selection Control Bar */}
            {isManualMode && (
              <div className="flex items-center justify-between gap-3 rounded-card border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <MousePointer size={15} className="shrink-0 text-emerald-400" />
                  <span>
                    Click and drag a box across the table region on the document page.
                  </span>
                </div>
                {finalBox && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-emerald-200">
                      [{finalBox.x1}, {finalBox.y1}] to [{finalBox.x2}, {finalBox.y2}]
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={processingManual}
                      onClick={handleSaveAndExtractManual}
                      icon={processingManual ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    >
                      {processingManual ? 'Processing...' : 'Save & Run PaddleOCR'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFinalBox(null);
                        setDrawRect(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div
              ref={containerRef}
              className="flex min-h-[580px] justify-center overflow-auto scrollbar-slim rounded-card border border-line bg-[#0f0f0f] p-6"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-ink-3">
                  <Loader2 className="animate-spin text-accent mb-3" size={28} />
                  <p className="text-sm">Loading document & detections from database...</p>
                </div>
              ) : dbDocument ? (
                <div
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  className="relative inline-block select-none shadow-2xl transition-transform duration-150"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <img
                    ref={imgRef}
                    src={getPageImageUrl(numericDocId, page)}
                    alt={`Document Page ${page}`}
                    className={`max-w-[720px] w-auto h-auto rounded-[4px] block border border-line-strong ${
                      isManualMode ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                  />

                  {/* Existing detected or saved regions overlay */}
                  {overlays &&
                    dbRegions
                      .filter((r) => r.page_number === page && r.x1 != null && r.y1 != null && r.image_width)
                      .map((r) => {
                        const isSelected = selectedId === r.id;
                        const style = getStyleForClass(r.class_name, isSelected);
                        const imgW = r.image_width || 800;
                        const imgH = r.image_height || 1000;
                        const left = `${((r.x1 || 0) / imgW) * 100}%`;
                        const top = `${((r.y1 || 0) / imgH) * 100}%`;
                        const width = `${(((r.x2 || 0) - (r.x1 || 0)) / imgW) * 100}%`;
                        const height = `${(((r.y2 || 0) - (r.y1 || 0)) / imgH) * 100}%`;

                        const displayLabel =
                          r.source === 'manual_selection'
                            ? 'MANUAL TABLE'
                            : r.source === 'model_fusion'
                            ? 'FUSED TABLE'
                            : r.class_name === 'signature'
                            ? 'SIGNATURE DETECTED'
                            : r.class_name === 'stamp'
                            ? 'STAMP DETECTED'
                            : r.class_name.toUpperCase();

                        return (
                          <div
                            key={`reg_${r.id}`}
                            onClick={() => setSelectedId(isSelected ? null : r.id)}
                            style={{ position: 'absolute', left, top, width, height }}
                            className={`cursor-pointer rounded-[3px] border-2 transition-all ${style.borderColor}`}
                          >
                            <span
                              className={`absolute -top-6 left-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium shadow ${style.badgeColor}`}
                            >
                              {displayLabel}
                            </span>
                          </div>
                        );
                      })}

                  {/* Live Drawing Rect */}
                  {drawRect && imgRef.current && (
                    <div
                      style={{
                        position: 'absolute',
                        left: Math.min(drawRect.startX, drawRect.currentX),
                        top: Math.min(drawRect.startY, drawRect.currentY),
                        width: Math.abs(drawRect.currentX - drawRect.startX),
                        height: Math.abs(drawRect.currentY - drawRect.startY),
                      }}
                      className="border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none rounded-[2px]"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-ink-3">
                  <p className="text-sm">Document page image unavailable.</p>
                </div>
              )}
            </div>

            {dbRegions.length === 0 && dbDetections.length === 0 && !loading && (
              <div className="flex items-center gap-2 rounded-card border border-line bg-panel px-4 py-3 text-xs text-ink-3">
                <AlertCircle size={15} className="shrink-0 text-amber-400" />
                <span>
                  No table regions identified yet. Click <strong>"Run YOLO Detection"</strong> or <strong>"Select Table Region"</strong> above to extract tables with real PaddleOCR.
                </span>
              </div>
            )}
          </div>

          {/* ── Analysis & Regions panel ── */}
          <div className="xl:col-span-4 space-y-5">
            <Panel
              title="Detection Inspector"
              subtitle="Two-model YOLO architecture (Model A: Layout, Model B: Elements)"
              actions={
                <div className="flex items-center gap-2">
                  <div className="flex rounded border border-line p-0.5 text-xs bg-raised">
                    <button
                      type="button"
                      onClick={() => setInspectorTab('regions')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        inspectorTab === 'regions' ? 'bg-panel text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      Fused Regions ({dbRegions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('raw_detections')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        inspectorTab === 'raw_detections' ? 'bg-panel text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      Raw YOLO ({dbDetections.length})
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fetchDocumentData}>
                    <RefreshCw size={13} />
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                {inspectorTab === 'regions' ? (
                  dbRegions.length > 0 ? (
                    dbRegions.map((r) => {
                      const isSelected = selectedId === r.id;
                      const isManual = r.source === 'manual_selection';
                      const isFused = r.source === 'model_fusion';

                      let title = 'Table Region';
                      if (r.class_name === 'signature') title = 'Signature Region Detected';
                      else if (r.class_name === 'stamp') title = 'Stamp Region Detected';
                      else if (isManual) title = 'Manual Table Region';
                      else if (isFused) title = 'Fused Table Region (Combined Evidence)';

                      return (
                        <div
                          key={r.id}
                          onClick={() => setSelectedId(isSelected ? null : r.id)}
                          className={`rounded-ctl border p-3 cursor-pointer transition-colors ${
                            isSelected ? 'border-line-strong bg-raised-2' : 'border-line bg-raised hover:bg-raised-2'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  isManual ? 'bg-emerald-400' : isFused ? 'bg-purple-400' : 'bg-sky-400'
                                }`}
                              />
                              <span className="text-[13px] font-medium text-ink">{title}</span>
                            </div>
                            <Badge tone={isManual ? 'ok' : isFused ? 'accent' : 'neutral'}>
                              {isManual ? 'Manual Selection' : isFused ? 'IoU Fused' : 'YOLO'}
                            </Badge>
                          </div>

                          <p className="mt-1 text-[11.5px] text-ink-3">
                            Region #{r.id} · Page {r.page_number} · Crop: {r.crop_width}×{r.crop_height}px
                            {r.supporting_detection_ids && (
                              <span className="block text-[11px] text-accent mt-0.5">
                                Supporting: {r.supporting_detection_ids}
                              </span>
                            )}
                          </p>

                          {/* Crop Preview Thumbnail */}
                          <div className="mt-2 overflow-hidden rounded border border-line/60 bg-black/40 p-1">
                            <img
                              src={getRegionImageUrl(r.id)}
                              alt={`Crop region ${r.id}`}
                              className="max-h-24 w-full object-contain rounded"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-ink-3 py-4 text-center">
                      No regions saved yet. Click "Run YOLO Detection" or "Select Table Region".
                    </p>
                  )
                ) : (
                  dbDetections.length > 0 ? (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-slim pr-1">
                      {dbDetections.map((d) => {
                        const isModelA = d.model_name === 'land_layout_detector';
                        return (
                          <div
                            key={d.id}
                            className="rounded-ctl border border-line bg-raised p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-ink uppercase tracking-wide">
                                {d.class_name}
                              </span>
                              <span className="font-mono text-accent-hi font-medium">
                                {(d.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-[11px] text-ink-3 flex items-center justify-between">
                              <span>Source: {isModelA ? 'Model A (Layout)' : 'Model B (Elements)'}</span>
                              <span className="font-mono text-[10px] text-ink-4">{d.id}</span>
                            </div>
                            <div className="font-mono text-[10px] text-ink-4">
                              BBox: [{d.bbox.x1}, {d.bbox.y1}] - [{d.bbox.x2}, {d.bbox.y2}]
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-3 py-4 text-center">
                      No raw detections recorded yet. Run YOLO detection first.
                    </p>
                  )
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
                  <span className="text-[12.5px] text-ink-3">Database Layer</span>
                  <Badge tone="accent">PostgreSQL 16</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-3">OCR Engine</span>
                  <span className="text-[12.5px] font-mono text-ink">PaddleOCR (Live)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-3">Saved Crops</span>
                  <span className="text-[12.5px] font-mono text-accent-hi">
                    {dbRegions.length} regions
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
