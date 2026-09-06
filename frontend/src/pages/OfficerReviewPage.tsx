import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDocument,
  getDetections,
  getFields,
  getValidation,
  getRegions,
  updateField,
  submitReview,
  approveDocument,
  exportDocument,
  getPageImageUrl,
} from '../api/client';
import { getDetectionColor, getStatusColor, getRiskColor, formatDate } from '../utils/helpers';
import type { DocumentOut, Detection, Region, ExtractedField, ValidationResponse } from '../types';

export default function OfficerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const docId = Number(id);

  const [document, setDocument] = useState<DocumentOut | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);

  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [savingCorrection, setSavingCorrection] = useState<boolean>(false);

  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewAction, setReviewAction] = useState<'FLAG' | 'REJECT'>('FLAG');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const loadAll = async () => {
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

      try {
        const val = await getValidation(docId);
        setValidation(val);
      } catch {
        setValidation(null);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Failed to load document' });
    }
  };

  useEffect(() => {
    loadAll();
  }, [docId]);

  const handleStartEdit = (f: ExtractedField) => {
    setEditingFieldId(f.id);
    setEditValue(f.normalized_value || f.value || '');
    setEditReason('');
  };

  const handleSaveEdit = async () => {
    if (!editingFieldId) return;
    if (!editReason.trim()) {
      setFeedback({ type: 'error', message: 'Audit trail requirement: Please provide a reason for correcting this field.' });
      return;
    }

    setSavingCorrection(true);
    try {
      await updateField(editingFieldId, editValue, editReason);
      setFeedback({ type: 'success', message: 'Field corrected successfully and recorded to immutable audit trail.' });
      setEditingFieldId(null);
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Failed to save correction' });
    } finally {
      setSavingCorrection(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to digitally approve this land record? This will mark it as verified.')) {
      return;
    }
    setSubmittingAction(true);
    try {
      await approveDocument(docId);
      setFeedback({ type: 'success', message: 'Document approved and certified successfully!' });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Approval failed' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSubmitReviewAction = async () => {
    if (!reviewNotes.trim()) {
      setFeedback({ type: 'error', message: 'Please enter officer notes explaining this action.' });
      return;
    }
    setSubmittingAction(true);
    try {
      await submitReview(docId, reviewAction, reviewNotes);
      setShowReviewModal(false);
      setFeedback({
        type: 'success',
        message: reviewAction === 'FLAG'
          ? 'Record flagged for field survey investigation.'
          : 'Record officially rejected.',
      });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Action failed' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await exportDocument(docId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `verified_land_record_${document?.khasra_number || docId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Export failed' });
    }
  };

  if (!document) {
    return <div className="p-8 text-center text-slate-500">Loading Officer Review Workstation...</div>;
  }

  const risk = getRiskColor(document.risk_level);
  const isApproved = document.status === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Workstation */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <h1 className="text-xl font-bold">Officer Verification Workstation</h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(document.status)}`}>
              {document.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            File: <span className="text-white font-medium">{document.original_filename}</span> • Village:{' '}
            <span className="text-white font-medium">{document.village || 'Pending'}</span> • Khasra:{' '}
            <span className="text-white font-medium">{document.khasra_number || 'Pending'}</span> • Uploaded:{' '}
            {formatDate(document.created_at)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate(`/documents/${docId}`)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            ← Back to Analysis
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            📥 Export Record (JSON)
          </button>

          {!isApproved && (
            <>
              <button
                onClick={() => {
                  setReviewAction('FLAG');
                  setShowReviewModal(true);
                }}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                🚩 Flag for Field Survey
              </button>

              <button
                onClick={() => {
                  setReviewAction('REJECT');
                  setShowReviewModal(true);
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                ✖ Reject Record
              </button>

              <button
                onClick={handleApprove}
                disabled={submittingAction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                ✅ Approve & Certify
              </button>
            </>
          )}

          {isApproved && (
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold">
              ✓ Digitally Certified Record
            </span>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-sm border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold ml-2 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Risk Summary Alert Banner */}
      {document.risk_level && (
        <div className={`p-4 rounded-xl border ${risk.bg} ${risk.border} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {document.risk_level === 'CRITICAL' || document.risk_level === 'HIGH' ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <p className={`text-sm font-bold ${risk.text}`}>
                Risk Assessment: {document.risk_level} (Calculated Score: {document.risk_score}/100)
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Deterministic risk score computed based on authoritative reference record cross-checks and legal chain validation.
              </p>
            </div>
          </div>
          <div className="w-32 bg-white/60 h-2.5 rounded-full overflow-hidden border border-slate-300">
            <div
              className={`h-full ${
                document.risk_score && document.risk_score > 60
                  ? 'bg-red-500'
                  : document.risk_score && document.risk_score > 30
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${document.risk_score || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Two-Column Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Document Canvas & Cropped Regions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Original Document Preview</h2>
              <span className="text-xs text-slate-500">Page 1 of {document.page_count}</span>
            </div>

            <div className="relative bg-slate-900/5 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2 min-h-[480px]">
              <div className="relative inline-block max-w-full">
                <img
                  src={getPageImageUrl(document.id, 1)}
                  alt="Document Page 1"
                  className="block max-w-full h-auto shadow-sm rounded"
                />

                {/* Overlaid BBoxes */}
                {detections.map(det => {
                  const colors = getDetectionColor(det.class_name);
                  const left = (det.bbox.x1 / det.image_width) * 100;
                  const top = (det.bbox.y1 / det.image_height) * 100;
                  const width = ((det.bbox.x2 - det.bbox.x1) / det.image_width) * 100;
                  const height = ((det.bbox.y2 - det.bbox.y1) / det.image_height) * 100;

                  return (
                    <div
                      key={det.id}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        border: `2px solid ${colors.stroke}`,
                        backgroundColor: colors.fill,
                      }}
                    >
                      <span
                        style={{ backgroundColor: colors.stroke }}
                        className="absolute -top-4 left-0 px-1 py-0.2 text-[9px] font-bold text-white rounded whitespace-nowrap"
                      >
                        {det.class_name.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cropped Region Snippets */}
          {regions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Extracted Layout Crops</h2>
              <div className="grid grid-cols-2 gap-3">
                {regions.map(r => (
                  <div key={r.id} className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                    <img
                      src={r.crop_url}
                      alt={r.class_name}
                      className="max-h-24 mx-auto object-contain bg-white rounded border border-slate-200"
                    />
                    <p className="text-[11px] font-semibold text-slate-700 capitalize mt-1.5">{r.class_name}</p>
                    <p className="text-[10px] text-slate-400">Crop ID: #{r.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Validation Findings & Interactive Field Correction */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section A: Automated Validation Findings */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Automated Validation Findings</h2>
              <span className="text-xs text-slate-500">Cross-referenced against Revenue Registry</span>
            </div>
            <div className="p-4 divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {!validation || !validation.results || validation.results.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No validation results yet. Return to the Analysis page and click "3. Run Validation".
                </div>
              ) : (
                validation.results.map((v, i) => {
                  const isFail = v.status === 'FAIL';
                  const isWarn = v.status === 'WARNING';
                  return (
                    <div key={i} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                            isFail ? 'bg-red-100 text-red-700' : isWarn ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {v.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{v.rule.replace(/_/g, ' ')}</span>
                        </div>
                        {v.severity && (
                          <span className="text-[10px] uppercase font-bold text-slate-400">{v.severity}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{v.message}</p>

                      {/* Evidence Details */}
                      {v.evidence && v.evidence.length > 0 && (
                        <div className="mt-2 bg-slate-50 p-2 rounded text-[11px] space-y-1 border border-slate-100">
                          {v.evidence.map((ev, ei) => (
                            <div key={ei} className="flex justify-between">
                              <span className="text-slate-500 font-medium">{ev.source}:</span>
                              <span className="font-mono text-slate-800">{ev.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {v.recommendation && (
                        <p className="text-[11px] text-blue-700 mt-1 italic">
                          💡 Recommendation: {v.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section B: Extracted Fields & Officer Correction Panel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Extracted Fields & Human-in-the-Loop Corrections</h2>
                <p className="text-[11px] text-slate-500">Click any field to correct values with full audit attribution</p>
              </div>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {fields.length} fields
              </span>
            </div>

            <div className="p-4">
              {fields.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No extracted fields found for this document.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map(f => {
                    const isEditing = editingFieldId === f.id;
                    const isCorrected = f.verification_status === 'CORRECTED';
                    return (
                      <div
                        key={f.id}
                        className={`p-3 rounded-lg border transition ${
                          isEditing
                            ? 'border-blue-500 bg-blue-50/30'
                            : isCorrected
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                              {f.field_name.replace(/_/g, ' ')}
                            </span>
                            {isCorrected && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                                ✓ Corrected by Officer
                              </span>
                            )}
                          </div>
                          {!isEditing && !isApproved && (
                            <button
                              onClick={() => handleStartEdit(f)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              Edit / Correct
                            </button>
                          )}
                        </div>

                        {!isEditing ? (
                          <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="text-sm font-mono font-semibold text-slate-900">
                              {f.normalized_value || f.value || '—'} {f.unit || ''}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Source: {f.extraction_method || 'AI Parser'}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 space-y-2 pt-2 border-t border-blue-100">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Corrected Value
                              </label>
                              <input
                                type="text"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Reason for Correction <span className="text-red-500">* (Audit Requirement)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Corrected 3.82 to 3.28 as per RoR Vol 4 Page 12"
                                value={editReason}
                                onChange={e => setEditReason(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingFieldId(null)}
                                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={savingCorrection}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50"
                              >
                                {savingCorrection ? 'Saving...' : 'Save Correction'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Action Modal (Flag for Investigation / Reject) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {reviewAction === 'FLAG' ? '🚩 Flag for Field Survey Investigation' : '✖ Reject Land Record'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {reviewAction === 'FLAG'
                ? 'This record will be queued for ground-truthing and physical measurement survey.'
                : 'This document will be marked as rejected due to irreconcilable fraud or corruption risk.'}
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Justification / Observations <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter official grounds and instructions for field surveyor..."
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReviewAction}
                disabled={submittingAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition shadow-xs ${
                  reviewAction === 'FLAG' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingAction ? 'Submitting...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
