import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDocument,
  getDetections,
  getRegions,
  getFields,
  detectLayout,
  extractTable,
  parseFields,
  validateDocument,
  getPageImageUrl,
} from '../api/client';
import { getDetectionColor, getStatusColor, getRiskColor, formatDate } from '../utils/helpers';
import type { DocumentOut, Detection, Region, ExtractedField } from '../types';

export default function DocumentAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const docId = Number(id);

  const [document, setDocument] = useState<DocumentOut | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [fields, setFields] = useState<ExtractedField[]>([]);

  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState<number>(0.35);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);

  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    if (!docId) return;
    try {
      const doc = await getDocument(docId);
      setDocument(doc);

      try {
        const dets = await getDetections(docId);
        setDetections(dets || []);
      } catch {
        setDetections([]);
      }

      try {
        const regs = await getRegions(docId);
        setRegions(regs || []);
      } catch {
        setRegions([]);
      }

      try {
        const flds = await getFields(docId);
        setFields(flds || []);
      } catch {
        setFields([]);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to load document' });
    }
  };

  useEffect(() => {
    loadData();
  }, [docId]);

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setActionMessage({ type: 'info', text: 'Running layout detection model...' });
    try {
      await detectLayout(docId);
      await loadData();
      setActionMessage({ type: 'success', text: 'Layout detection completed! Detected tables, stamps, and signatures.' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Detection failed' });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRunExtraction = async () => {
    setIsExtracting(true);
    setActionMessage({ type: 'info', text: 'Extracting text from tables and parsing structured fields...' });
    try {
      // If table regions exist, trigger extract on each
      const tableRegions = regions.filter(r => r.class_name.toLowerCase() === 'table');
      for (const tr of tableRegions) {
        await extractTable(tr.id);
      }
      await parseFields(docId);
      await loadData();
      setActionMessage({ type: 'success', text: 'Field extraction & normalization complete!' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Extraction failed' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    setActionMessage({ type: 'info', text: 'Executing validation engine against reference registry...' });
    try {
      const valRes = await validateDocument(docId);
      await loadData();
      setActionMessage({ type: 'success', text: `Validation complete. Risk Level: ${valRes.risk_level} (Score: ${valRes.risk_score}/100)` });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Validation failed' });
    } finally {
      setIsValidating(false);
    }
  };

  if (!document) {
    return <div className="p-8 text-center text-slate-500">Loading document analysis workspace...</div>;
  }

  const filteredDetections = detections.filter(d => d.confidence >= minConfidence);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{document.original_filename}</h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(document.status)}`}>
              {document.status.replace(/_/g, ' ')}
            </span>
            {document.risk_level && (
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getRiskColor(document.risk_level).bg} ${getRiskColor(document.risk_level).text}`}>
                {document.risk_level} ({document.risk_score}/100)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Doc ID: #{document.id} • Uploaded: {formatDate(document.created_at)} • {document.page_count} page(s) • Format: {document.file_type.toUpperCase()}
          </p>
        </div>

        {/* Action Pipeline Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunDetection}
            disabled={isDetecting}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            {isDetecting ? '🔍 Detecting...' : '🔍 1. Run Layout Detection'}
          </button>
          <button
            onClick={handleRunExtraction}
            disabled={isExtracting || detections.length === 0}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            {isExtracting ? '📑 Extracting...' : '📑 2. Extract & Parse'}
          </button>
          <button
            onClick={handleRunValidation}
            disabled={isValidating || fields.length === 0}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            {isValidating ? '⚖️ Validating...' : '⚖️ 3. Run Validation'}
          </button>
          <button
            onClick={() => navigate(`/review/${document.id}`)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            👨‍💼 Officer Review Workstation →
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-lg text-sm border flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : actionMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold ml-2 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Document Viewer with Bounding Boxes */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
          {/* Viewer Toolbar */}
          <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">Document Canvas</span>
              {document.page_count > 1 && (
                <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-2 py-0.5 rounded bg-white disabled:opacity-40"
                  >
                    ◀
                  </button>
                  <span className="px-1 text-slate-600">Page {currentPage} of {document.page_count}</span>
                  <button
                    disabled={currentPage >= document.page_count}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-2 py-0.5 rounded bg-white disabled:opacity-40"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showBoxes}
                  onChange={e => setShowBoxes(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                Show Bounding Boxes
              </label>

              <div className="flex items-center gap-2">
                <span>Confidence ≥ {(minConfidence * 100).toFixed(0)}%</span>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={minConfidence}
                  onChange={e => setMinConfidence(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Document Canvas with Overlay */}
          <div className="relative bg-slate-900/5 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2 min-h-[520px]">
            <div className="relative inline-block max-w-full">
              <img
                src={getPageImageUrl(document.id, currentPage)}
                alt={`Page ${currentPage}`}
                className="block max-w-full h-auto shadow-md rounded"
                onError={e => {
                  (e.target as HTMLImageElement).alt = 'Document page preview unavailable or still processing';
                }}
              />

              {/* Responsive Bounding Boxes */}
              {showBoxes &&
                filteredDetections.map(det => {
                  const colors = getDetectionColor(det.class_name);
                  const isSelected = selectedDetectionId === det.id;
                  const left = (det.bbox.x1 / det.image_width) * 100;
                  const top = (det.bbox.y1 / det.image_height) * 100;
                  const width = ((det.bbox.x2 - det.bbox.x1) / det.image_width) * 100;
                  const height = ((det.bbox.y2 - det.bbox.y1) / det.image_height) * 100;

                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetectionId(det.id)}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        borderWidth: isSelected ? '3px' : '2px',
                        borderStyle: 'solid',
                        borderColor: colors.stroke,
                        backgroundColor: isSelected ? colors.fill.replace('0.12', '0.28') : colors.fill,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                        boxShadow: isSelected ? `0 0 10px ${colors.stroke}` : 'none',
                      }}
                      className="group"
                    >
                      <span
                        style={{ backgroundColor: colors.stroke }}
                        className="absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-bold text-white rounded shadow-sm whitespace-nowrap"
                      >
                        {det.class_name.toUpperCase()} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Detections Legend */}
          <div className="flex items-center gap-4 mt-3 pt-2 text-xs border-t border-slate-100 text-slate-600">
            <span className="font-medium text-slate-700">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
              <span>Table</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-violet-600 inline-block"></span>
              <span>Signature</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
              <span>Stamp</span>
            </div>
            <span className="ml-auto text-slate-400">
              Showing {filteredDetections.length} of {detections.length} detections
            </span>
          </div>
        </div>

        {/* Right Column: Detections List & Cropped Regions & Parsed Fields */}
        <div className="lg:col-span-5 space-y-6">
          {/* Detected Objects Panel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Detected Layout Elements</h2>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {filteredDetections.length} detected
              </span>
            </div>
            <div className="p-3 max-h-56 overflow-y-auto space-y-2">
              {filteredDetections.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {detections.length === 0
                    ? 'No detections yet. Click "1. Run Layout Detection" above.'
                    : 'No detections meet the confidence filter.'}
                </div>
              ) : (
                filteredDetections.map(det => {
                  const colors = getDetectionColor(det.class_name);
                  const isSelected = selectedDetectionId === det.id;
                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetectionId(det.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: colors.stroke }}
                          className="w-2.5 h-2.5 rounded-full"
                        ></span>
                        <div>
                          <p className="font-semibold text-slate-800 capitalize">{det.class_name}</p>
                          <p className="text-[11px] text-slate-400">
                            Box: [{det.bbox.x1}, {det.bbox.y1}] → [{det.bbox.x2}, {det.bbox.y2}]
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-slate-700">
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-400">confidence</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cropped Regions Gallery */}
          {regions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Cropped Table & Region Artifacts</h2>
                <span className="text-xs text-slate-500">{regions.length} crops saved</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {regions.map(r => (
                  <div key={r.id} className="border border-slate-200 rounded p-1.5 bg-slate-50 flex flex-col items-center">
                    <img
                      src={r.crop_url}
                      alt={r.class_name}
                      className="max-h-20 object-contain rounded border border-slate-200 bg-white"
                    />
                    <div className="w-full flex justify-between items-center mt-1 text-[10px] text-slate-600 px-1">
                      <span className="capitalize font-medium">{r.class_name} #{r.id}</span>
                      <span>{r.crop_width}×{r.crop_height}px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Fields Summary */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Extracted Land Record Fields</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
                {fields.length} fields parsed
              </span>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto">
              {fields.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No fields extracted yet. Click "2. Extract & Parse" to read table contents.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="text-left pb-2">Field</th>
                      <th className="text-left pb-2">Extracted Value</th>
                      <th className="text-left pb-2">Normalized</th>
                      <th className="text-right pb-2">Conf.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fields.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-1.5 font-medium text-slate-700">{f.field_name.replace(/_/g, ' ')}</td>
                        <td className="py-1.5 text-slate-800 font-mono">{f.value || '—'}</td>
                        <td className="py-1.5 text-slate-600 font-mono">{f.normalized_value || f.value || '—'}</td>
                        <td className="py-1.5 text-right font-mono text-slate-500">
                          {f.confidence ? `${(f.confidence * 100).toFixed(0)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
