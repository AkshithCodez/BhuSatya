import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, CheckCircle2, Flag, AlertTriangle,
  Loader2, AlertCircle, Download, Edit3, RefreshCw, Scissors, ExternalLink,
  EyeOff, Ban, ChevronDown, ChevronUp, ShieldCheck, FileCheck
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from '../components/ui/Table';
import {
  getDocument, getRegions, getFields, getValidation, validateDocument,
  updateField, updateFieldStatus, approveDocument, rejectDocument,
  investigateDocument, exportDocument, getPageImageUrl, getRegionImageUrl,
  getVerifiedRecord, getAuditEvents
} from '../api/client';
import type {
  DocumentOut, Region, ExtractedField, ValidationResponse,
  VerifiedRecordResponse, AuditEvent, ValidationResult
} from '../types';

export default function VerificationCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const docId = caseId && /^\d+$/.test(caseId) ? Number(caseId) : null;

  // Real data state
  const [doc, setDoc] = useState<DocumentOut | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [verifiedRecord, setVerifiedRecord] = useState<VerifiedRecordResponse | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Discrepancy details expand/collapse state
  const [expandedRules, setExpandedRules] = useState<Record<number, boolean>>({});

  // Field Correction Modal State
  const [editModalField, setEditModalField] = useState<ExtractedField | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  // Decision Modal State (Reject / Investigate)
  const [decisionModalType, setDecisionModalType] = useState<'REJECT' | 'INVESTIGATE' | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [decisionSubmitting, setDecisionSubmitting] = useState<boolean>(false);

  // Override / Approval Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [approveSubmitting, setApproveSubmitting] = useState<boolean>(false);

  const loadData = () => {
    if (!docId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all([
      getDocument(docId),
      getRegions(docId).catch(() => []),
      getFields(docId).catch(() => []),
      getValidation(docId).catch(() => null),
      getVerifiedRecord(docId).catch(() => null),
      getAuditEvents(docId).catch(() => ({ events: [], total: 0 })),
    ])
      .then(([docData, regionsData, fieldsData, valData, verifiedData, auditData]) => {
        setDoc(docData);
        setRegions(Array.isArray(regionsData) ? regionsData : []);
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
        setValidation(valData);
        setVerifiedRecord(verifiedData);
        setAuditEvents(auditData && Array.isArray(auditData.events) ? auditData.events : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load case data from PostgreSQL');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [docId]);

  const handleRunValidation = async () => {
    if (!docId) return;
    setLoading(true);
    setActionSuccess(null);
    setError(null);
    try {
      const val = await validateDocument(docId);
      setValidation(val);
      setActionSuccess('Validation rules executed against PostgreSQL cadastral registry.');
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Validation failed');
      setLoading(false);
    }
  };

  const handleOpenEditModal = (f: ExtractedField) => {
    setEditModalField(f);
    setEditValue(f.value || f.raw_value || '');
    setEditReason('');
  };

  const handleSaveCorrection = async () => {
    if (!editModalField || !editReason.trim()) return;
    setEditSubmitting(true);
    setError(null);
    try {
      await updateField(editModalField.id, editValue, editReason.trim());
      setActionSuccess(`Field '${editModalField.field_name}' corrected with audit history preserved.`);
      setEditModalField(null);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to correct field');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    fieldId: number,
    status: 'CONFIRMED' | 'FLAGGED' | 'UNREADABLE' | 'NOT_APPLICABLE'
  ) => {
    try {
      await updateFieldStatus(fieldId, status);
      setActionSuccess(`Field status updated to ${status}.`);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to update field status');
    }
  };

  // Critical failure check
  const criticalFailures = (validation?.results || []).filter(
    (r) => r.status === 'FAIL' && r.severity === 'CRITICAL'
  );

  const handleApproveClick = () => {
    if (!docId) return;
    if (criticalFailures.length > 0) {
      // Require override justification
      setOverrideReason('');
      setOverrideModalOpen(true);
    } else {
      // Execute standard approval
      executeApproval();
    }
  };

  const executeApproval = async (override?: string) => {
    if (!docId) return;
    setApproveSubmitting(true);
    setError(null);
    try {
      await approveDocument(docId, override ? { override_reason: override } : undefined);
      setActionSuccess('Document verified and officially approved. Audit log persisted.');
      setOverrideModalOpen(false);
      setOverrideReason('');
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Approval failed');
    } finally {
      setApproveSubmitting(false);
    }
  };

  const handleConfirmDecision = async () => {
    if (!docId || !decisionModalType || !decisionReason.trim()) return;
    setDecisionSubmitting(true);
    try {
      if (decisionModalType === 'REJECT') {
        await rejectDocument(docId, decisionReason.trim());
        setActionSuccess('Document rejected. Decision recorded in PostgreSQL audit trail.');
      } else {
        await investigateDocument(docId, decisionReason.trim());
        setActionSuccess('Document referred for investigation. Status updated.');
      }
      setDecisionModalType(null);
      setDecisionReason('');
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Action failed');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleExportJson = async () => {
    if (!docId) return;
    try {
      const data = await exportDocument(docId);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bhusatya_doc_${docId}_verified_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Export failed');
    }
  };

  const toggleRuleExpand = (idx: number) => {
    setExpandedRules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!docId) {
    return (
      <Panel className="p-12 text-center">
        <h2 className="text-base font-medium text-ink">Invalid Document ID</h2>
        <p className="mt-1 text-xs text-ink-3">Please select a valid document from the verification queue.</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/verification')}>
          Back to Verification Cases
        </Button>
      </Panel>
    );
  }

  return (
    <>
      <PageHeader
        title={doc ? `Case #${doc.id}: ${doc.original_filename}` : `Verification Case #${docId}`}
        subtitle={
          doc
            ? `Status: ${doc.status} · Village: ${doc.village || 'N/A'} · Khasra: ${doc.khasra_number || 'N/A'} · Format: ${doc.file_type}`
            : 'Loading document verification record...'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/verification')} icon={<ArrowLeft size={13} />}>
              Queue
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/analysis?docId=${docId}`)}
              icon={<Scissors size={13} />}
            >
              Table Selection
            </Button>
            <Button variant="ghost" size="sm" onClick={loadData} icon={<RefreshCw size={13} />}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportJson} icon={<Download size={13} />}>
              Export JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApproveClick}
              icon={<Check size={13} />}
              disabled={loading || doc?.status === 'VERIFIED'}
            >
              Approve Record
            </Button>
            <Button
              variant="reject"
              size="sm"
              onClick={() => {
                setDecisionModalType('REJECT');
                setDecisionReason('');
              }}
              icon={<Flag size={13} />}
              disabled={loading || doc?.status === 'REJECTED'}
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDecisionModalType('INVESTIGATE');
                setDecisionReason('');
              }}
              icon={<AlertTriangle size={13} />}
              disabled={loading || doc?.status === 'INVESTIGATION_REQUIRED'}
            >
              Investigate
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Verified Record Endorsement Banner (Section 14) */}
      {doc?.status === 'VERIFIED' && (
        <div className="mb-5 rounded-card border border-emerald-500/40 bg-emerald-950/20 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">Official Verified Land Record</h3>
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    STATUS: VERIFIED
                  </span>
                </div>
                <p className="text-xs text-ink-3 mt-0.5">
                  Endorsed by {verifiedRecord?.review?.reviewer_name || 'Verification Officer'}
                  {verifiedRecord?.review?.reviewed_at
                    ? ` on ${new Date(verifiedRecord.review.reviewed_at).toLocaleString()}`
                    : ''}.
                  Persisted with immutable audit integrity.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportJson} icon={<FileCheck size={13} />}>
                Export Canonical JSON
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-ink-3">
          <Loader2 className="animate-spin text-accent mb-3" size={28} />
          <p className="text-sm">Loading verification details from PostgreSQL...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column (8 cols): Fields Table & Validation Rules */}
            <div className="xl:col-span-8 space-y-5">
              {/* Extracted Fields Panel */}
              <Panel
                title="Structured Land Record Fields (PostgreSQL Extracted)"
                subtitle="Parsed from PaddleOCR table extractions with individual field verification actions."
                actions={
                  <Badge tone={fields.length > 0 ? 'ok' : 'neutral'}>
                    {fields.length} Fields Parsed
                  </Badge>
                }
              >
                <Table minWidth={750}>
                  <THead>
                    <TH>Field Name</TH>
                    <TH>Current Value</TH>
                    <TH>Original OCR Value</TH>
                    <TH>Confidence</TH>
                    <TH>Status</TH>
                    <TH align="right">Actions</TH>
                  </THead>
                  <TBody>
                    {fields.length === 0 ? (
                      <EmptyRow
                        colSpan={6}
                        message="No structured fields parsed yet. Navigate to Table Selection to draw a region and run PaddleOCR text extraction."
                      />
                    ) : (
                      fields.map((f) => (
                        <TR key={f.id}>
                          <TD className="font-mono text-xs font-medium text-ink">
                            {f.field_name}
                          </TD>
                          <TD className="text-xs font-semibold text-ink">
                            {f.value !== null && f.value !== '' ? (
                              <span>
                                {f.value} {f.unit ? <span className="text-ink-3 font-normal">({f.unit})</span> : ''}
                              </span>
                            ) : (
                              <span className="text-ink-4 italic">unavailable</span>
                            )}
                          </TD>
                          <TD className="text-xs text-ink-3 font-mono">
                            {f.raw_value !== null ? f.raw_value : <span className="text-ink-4 italic">not extracted</span>}
                          </TD>
                          <TD className="text-xs font-mono text-ink-2">
                            {f.confidence !== null ? `${(f.confidence * 100).toFixed(1)}%` : <span className="text-ink-4 italic">N/A</span>}
                          </TD>
                          <TD>
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-[10.5px] font-mono font-medium ${
                                f.verification_status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : f.verification_status === 'CORRECTED'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : f.verification_status === 'FLAGGED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : f.verification_status === 'UNREADABLE'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : f.verification_status === 'NOT_APPLICABLE'
                                  ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40'
                                  : 'bg-white/10 text-ink-3 border border-white/10'
                              }`}
                            >
                              {f.verification_status}
                            </span>
                          </TD>
                          <TD align="right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Field */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-ink-2 hover:text-ink"
                                title="Edit field value (preserves raw value)"
                                onClick={() => handleOpenEditModal(f)}
                              >
                                <Edit3 size={12} />
                              </Button>
                              {/* Confirm Field */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-emerald-400 hover:text-emerald-300"
                                title="Confirm field as verified"
                                onClick={() => handleUpdateStatus(f.id, 'CONFIRMED')}
                              >
                                <Check size={12} />
                              </Button>
                              {/* Flag Discrepancy */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-rose-400 hover:text-rose-300"
                                title="Flag field discrepancy"
                                onClick={() => handleUpdateStatus(f.id, 'FLAGGED')}
                              >
                                <Flag size={12} />
                              </Button>
                              {/* Mark Unreadable */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-purple-400 hover:text-purple-300"
                                title="Mark as unreadable"
                                onClick={() => handleUpdateStatus(f.id, 'UNREADABLE')}
                              >
                                <EyeOff size={12} />
                              </Button>
                              {/* Mark Not Applicable */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-zinc-400 hover:text-zinc-300"
                                title="Mark as not applicable"
                                onClick={() => handleUpdateStatus(f.id, 'NOT_APPLICABLE')}
                              >
                                <Ban size={12} />
                              </Button>
                            </div>
                          </TD>
                        </TR>
                      ))
                    )}
                  </TBody>
                </Table>
              </Panel>

              {/* Validation Engine Results Panel (Explainable Evidence) */}
              <Panel
                title="Cadastral Reference Registry Validation & Explainable Discrepancies"
                subtitle="Rule-by-rule evaluation against parcels, registered owners, mutation transfers, and administrative hierarchy."
                actions={
                  <Button variant="secondary" size="sm" onClick={handleRunValidation} icon={<RefreshCw size={12} />}>
                    Run Validation
                  </Button>
                }
              >
                {validation && validation.results && validation.results.length > 0 ? (
                  <div className="space-y-3">
                    {validation.results.map((r: ValidationResult, idx: number) => {
                      const isExpanded = !!expandedRules[idx];
                      const isFail = r.status === 'FAIL';
                      const isWarn = r.status === 'WARN' || r.status === 'WARNING';
                      const isPass = r.status === 'PASS';

                      return (
                        <div
                          key={idx}
                          className={`rounded-ctl border p-3.5 transition-colors ${
                            isFail
                              ? 'border-rose-500/30 bg-rose-950/10'
                              : isWarn
                              ? 'border-amber-500/30 bg-amber-950/10'
                              : isPass
                              ? 'border-line bg-raised'
                              : 'border-sky-500/20 bg-sky-950/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-ink">
                                  {r.rule_code || r.rule}
                                </span>
                                {/* Status Badge */}
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                                    isPass
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : isFail
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : isWarn
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  }`}
                                >
                                  {r.status}
                                </span>
                                {/* Severity Badge */}
                                {r.severity && (
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                                      r.severity === 'CRITICAL'
                                        ? 'bg-rose-600/30 text-rose-200 border border-rose-500/60'
                                        : r.severity === 'HIGH'
                                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                        : r.severity === 'MEDIUM'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40'
                                    }`}
                                  >
                                    SEVERITY: {r.severity}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-ink-2 leading-relaxed">{r.message}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 py-1 text-xs text-ink-3 hover:text-ink"
                                onClick={() => toggleRuleExpand(idx)}
                              >
                                {isExpanded ? (
                                  <span className="flex items-center gap-1">Hide Evidence <ChevronUp size={12} /></span>
                                ) : (
                                  <span className="flex items-center gap-1">View Evidence <ChevronDown size={12} /></span>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Expandable Evidence Detail Section (Section 21) */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-line/60 space-y-2.5 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded bg-panel/60 p-2.5 border border-line">
                                  <span className="text-[11px] font-semibold text-ink-3 uppercase block mb-1">
                                    Extracted / Uploaded Value
                                  </span>
                                  <span className="font-mono text-ink text-xs">
                                    {r.uploaded_value || <span className="text-ink-4 italic">None provided</span>}
                                  </span>
                                </div>
                                <div className="rounded bg-panel/60 p-2.5 border border-line">
                                  <span className="text-[11px] font-semibold text-ink-3 uppercase block mb-1">
                                    Cadastral Reference Value
                                  </span>
                                  <span className="font-mono text-ink text-xs">
                                    {r.reference_values
                                      ? JSON.stringify(r.reference_values)
                                      : <span className="text-ink-4 italic">No matching reference row</span>}
                                  </span>
                                </div>
                              </div>

                              {r.evidence && r.evidence.length > 0 && (
                                <div className="rounded bg-panel/60 p-2.5 border border-line">
                                  <span className="text-[11px] font-semibold text-ink-3 uppercase block mb-1.5">
                                    Evidentiary Comparison Points
                                  </span>
                                  <div className="space-y-1 font-mono text-[11.5px]">
                                    {r.evidence.map((ev, eIdx) => (
                                      <div key={eIdx} className="flex items-start gap-2">
                                        <span className="text-ink-3 shrink-0">[{ev.source}]:</span>
                                        <span className="text-ink-2">{ev.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {r.recommendation && (
                                <div className="rounded bg-accent/10 border border-accent/20 p-2.5 text-accent-light">
                                  <span className="font-semibold block text-[11px] uppercase mb-0.5">
                                    Officer Recommended Action:
                                  </span>
                                  <span>{r.recommendation}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-ink-3">
                    <p className="text-xs">No validation results recorded. Click "Run Validation" to evaluate against registry.</p>
                  </div>
                )}
              </Panel>
            </div>

            {/* Right Column (4 cols): Risk Assessment, Crops, Page Preview */}
            <div className="xl:col-span-4 space-y-5">
              {/* Risk Assessment Summary */}
              <Panel title="Review Priority & Assessment">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-ink-3">Priority Level</span>
                    {doc?.risk_level ? (
                      <Badge
                        tone={
                          doc.risk_level === 'LOW'
                            ? 'ok'
                            : doc.risk_level === 'CRITICAL'
                            ? 'danger'
                            : doc.risk_level === 'HIGH'
                            ? 'warn'
                            : 'neutral'
                        }
                      >
                        {doc.risk_level}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-4 italic">INSUFFICIENT_DATA</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-ink-3">Calculated Risk Score</span>
                    <span className="font-mono text-[13px] text-ink font-semibold">
                      {doc?.risk_score !== null && doc?.risk_score !== undefined
                        ? `${doc.risk_score.toFixed(1)} / 100`
                        : <span className="text-ink-4 italic font-normal">insufficient data</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-ink-3">Document Status</span>
                    <Badge tone={doc?.status === 'VERIFIED' ? 'ok' : 'accent'}>
                      {doc?.status || 'UNKNOWN'}
                    </Badge>
                  </div>
                  {criticalFailures.length > 0 && (
                    <div className="mt-2 rounded border border-rose-500/40 bg-rose-950/20 p-2.5 text-xs text-rose-300">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-200 mb-0.5">
                        <AlertTriangle size={13} />
                        <span>Critical Discrepancies ({criticalFailures.length})</span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 leading-tight">
                        Approval is strictly locked unless an official override reason is provided.
                      </p>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Document Page & Crops Preview */}
              <Panel
                title="Evidentiary Table Regions"
                subtitle="Crops saved in PostgreSQL storage."
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/analysis?docId=${docId}`)}
                    icon={<ExternalLink size={12} />}
                  >
                    Inspect
                  </Button>
                }
              >
                <div className="space-y-3">
                  {/* Page Thumbnail */}
                  <div className="rounded border border-line bg-black/40 p-2">
                    <span className="text-[11px] font-medium text-ink-3 block mb-1.5">
                      Original Document Page 1
                    </span>
                    <img
                      src={getPageImageUrl(docId, 1)}
                      alt="Page 1"
                      className="max-h-40 w-full object-contain rounded border border-line/40"
                    />
                  </div>

                  {/* Table Region Crops */}
                  {regions.map((r) => (
                    <div key={r.id} className="rounded border border-line bg-raised p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink">
                          Region #{r.id} ({r.source === 'manual_selection' ? 'Manual Selection' : 'YOLO'})
                        </span>
                        <span className="text-[10.5px] font-mono text-ink-3">
                          {r.crop_width}×{r.crop_height}px
                        </span>
                      </div>
                      <img
                        src={getRegionImageUrl(r.id)}
                        alt={`Region ${r.id}`}
                        className="max-h-24 w-full object-contain rounded border border-line/40 bg-black/30"
                      />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          {/* Embedded Document Audit Trail Panel (Section 13) */}
          <Panel
            title="Append-Only Document Audit Trail"
            subtitle="Chronological record of validations, officer corrections, status transitions, and overrides."
            actions={
              <Badge tone="neutral">
                {auditEvents.length} Audit Events Recorded
              </Badge>
            }
          >
            <Table minWidth={700}>
              <THead>
                <TH>Timestamp</TH>
                <TH>Event Type</TH>
                <TH>Description</TH>
                <TH>Actor / Officer ID</TH>
              </THead>
              <TBody>
                {auditEvents.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    message="No audit trail events recorded for this document yet."
                  />
                ) : (
                  auditEvents.map((ev) => (
                    <TR key={ev.id}>
                      <TD className="text-xs font-mono text-ink-3 whitespace-nowrap">
                        {ev.created_at ? new Date(ev.created_at).toLocaleString() : 'N/A'}
                      </TD>
                      <TD>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                            ev.event_type.includes('APPROVED')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : ev.event_type.includes('REJECTED')
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : ev.event_type.includes('OVERRIDE')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : ev.event_type.includes('CORRECTED')
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-white/10 text-ink-3 border border-white/10'
                          }`}
                        >
                          {ev.event_type}
                        </span>
                      </TD>
                      <TD className="text-xs text-ink-2 font-mono">
                        {ev.description}
                      </TD>
                      <TD className="text-xs font-mono text-ink-3">
                        {ev.user_id !== null ? `Officer #${ev.user_id}` : 'System / Auto'}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Panel>
        </div>
      )}

      {/* Field Correction Modal (Section 10 & 11) */}
      {editModalField && (
        <Modal
          open={Boolean(editModalField)}
          onClose={() => setEditModalField(null)}
          title={`Correct Field: ${editModalField.field_name}`}
          subtitle="Modifying this field creates a verifiable audit record while preserving the original raw OCR extraction."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditModalField(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={editSubmitting || !editReason.trim()}
                onClick={handleSaveCorrection}
              >
                {editSubmitting ? 'Saving...' : 'Save Correction'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3.5 py-1">
            <div>
              <label className="text-[11.5px] font-medium text-ink-3 block mb-1">Original Raw OCR</label>
              <div className="rounded border border-line bg-raised px-3 py-2 text-xs font-mono text-ink-2">
                {editModalField.raw_value || 'None'}
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-ink-3 block mb-1">New Verified Value</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full rounded border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                placeholder="Enter verified value"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-ink-3 block mb-1">
                Correction Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={3}
                className="w-full rounded border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                placeholder="Specify reason for correction (e.g. Verified against physical deed register)"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Modal (Reject / Investigate) */}
      {decisionModalType && (
        <Modal
          open={Boolean(decisionModalType)}
          onClose={() => setDecisionModalType(null)}
          title={decisionModalType === 'REJECT' ? 'Reject Document Record' : 'Refer for Investigation'}
          subtitle={
            decisionModalType === 'REJECT'
              ? 'This document will be marked as rejected and excluded from active registry updates.'
              : 'This document will be flagged for in-depth administrative investigation.'
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDecisionModalType(null)}>
                Cancel
              </Button>
              <Button
                variant={decisionModalType === 'REJECT' ? 'reject' : 'primary'}
                size="sm"
                disabled={decisionSubmitting || !decisionReason.trim()}
                onClick={handleConfirmDecision}
              >
                {decisionSubmitting ? 'Submitting...' : 'Confirm Decision'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-1">
            <label className="text-[11.5px] font-medium text-ink-3 block mb-1">
              Officer Decision Notes / Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              rows={4}
              className="w-full rounded border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              placeholder="State the technical, legal, or evidentiary reason for this decision..."
            />
          </div>
        </Modal>
      )}

      {/* Critical Override Approval Modal (Section 12) */}
      {overrideModalOpen && (
        <Modal
          open={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          title="Critical Validation Discrepancy Override"
          subtitle="One or more critical validation rules failed. Official justification is required to override."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOverrideModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={approveSubmitting || !overrideReason.trim()}
                onClick={() => executeApproval(overrideReason.trim())}
              >
                {approveSubmitting ? 'Overriding...' : 'Confirm Override & Approve'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3.5 py-1">
            <div className="rounded border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300">
              <span className="font-semibold text-rose-200 block mb-1">Unresolved Critical Rules:</span>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11.5px]">
                {criticalFailures.map((r, i) => (
                  <li key={i}>{r.rule_code || r.rule}: {r.message}</li>
                ))}
              </ul>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-ink-3 block mb-1">
                Official Override Justification <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={4}
                className="w-full rounded border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                placeholder="State the official administrative, survey, or gazette order permitting approval despite critical reference discrepancy (e.g. Approved per Sub-Divisional Magistrate Order #2026/LR-901)..."
              />
              <p className="mt-1 text-[11px] text-ink-3">
                This explanation will be permanently recorded as an <code>OVERRIDE_APPLIED</code> event in the append-only PostgreSQL audit trail.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
