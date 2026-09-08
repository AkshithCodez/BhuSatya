import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Flag, PenLine } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';
import { KeyValue, KeyValueList } from '../components/ui/KeyValue';
import { Label, TextArea } from '../components/ui/Field';
import { getCaseById, updateCaseStatus, type VerificationCase } from '../data/mockCases';

type Decision = 'Approved' | 'Needs Review' | 'Flagged';

const DECISION_COPY: Record<Decision, { title: string; body: string; cta: string }> = {
  Approved: {
    title: 'Approve this case',
    body: 'The land record will be marked verified and the decision written to the audit trail.',
    cta: 'Approve case',
  },
  'Needs Review': {
    title: 'Send for manual review',
    body: 'The case stays open and is referred for a physical or supervisory check.',
    cta: 'Send for review',
  },
  Flagged: {
    title: 'Reject this case',
    body: 'The case is flagged for dispute resolution and will not update the land record.',
    cta: 'Reject case',
  },
};

export default function VerificationCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [current, setCurrent] = useState<VerificationCase | undefined>(() =>
    getCaseById(caseId || 'BLR-2026-8819')
  );
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  if (!current) {
    return (
      <Panel>
        <div className="py-12 text-center">
          <h2 className="text-[16px] font-semibold text-ink">Case not found</h2>
          <p className="mt-1.5 text-[13px] text-ink-3">
            No verification case matches “{caseId}”.
          </p>
          <Button variant="primary" className="mt-5" onClick={() => navigate('/verification')}>
            Back to Verification Cases
          </Button>
        </div>
      </Panel>
    );
  }

  const openDecision = (d: Decision) => {
    setDecision(d);
    setNote('');
    setNoteError('');
  };

  const confirm = () => {
    if (!decision) return;
    if (decision !== 'Approved' && !note.trim()) {
      setNoteError('A short note is required for this decision.');
      return;
    }
    const updated = updateCaseStatus(current.id, decision, note.trim());
    if (updated) setCurrent(updated);
    setDecision(null);
  };

  const findings: [string, string][] = [
    ['Text', current.findings.textDetected],
    ['Tables', current.findings.tablesDetected],
    ['Signature', current.findings.signatureDetected],
    ['Stamp', current.findings.stampDetected],
    ['Inconsistencies', current.findings.inconsistencies],
  ];

  return (
    <>
      <PageHeader
        title={`Case ${current.id}`}
        subtitle={`${current.docType} · ${current.village}, ${current.taluk}, ${current.district}`}
        actions={
          <>
            <StatusBadge status={current.status} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/analysis/${current.id}`)}
              iconRight={<ArrowRight size={14} strokeWidth={2} />}
            >
              View document analysis
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Document */}
        <div className="xl:col-span-7 xl:sticky xl:top-0">
          <Panel title="Document Preview" actions={<span className="text-[12px] text-ink-3">Page 1 of 2</span>}>
            <div className="min-h-[440px] select-none rounded-ctl border border-slate-300 bg-[#faf8f3] p-6 font-serif text-[12px] leading-relaxed text-slate-800">
              <div className="mb-3 border-b border-slate-400 pb-3 text-center">
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                  Government of Karnataka · Revenue Department
                </p>
                <p className="mt-1 text-[14px] font-bold text-slate-900">{current.docType}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Survey No. {current.surveyNo} · Extent {current.extent}
                </p>
              </div>

              <p>
                This instrument records that{' '}
                <strong className="font-sans font-semibold">{current.ownerName}</strong> is
                registered as the titleholder of the parcel situated in{' '}
                <strong className="font-sans font-semibold">{current.village} Village</strong>,{' '}
                {current.taluk} Taluk, {current.district}.
              </p>

              <div className="my-4 space-y-1.5 rounded border border-slate-300 bg-slate-100 p-3 font-sans text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document type</span>
                  <span className="font-semibold">{current.docType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Survey number</span>
                  <span className="font-semibold">Sy. {current.surveyNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jurisdiction</span>
                  <span>
                    {current.village}, {current.taluk}, {current.district}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered on</span>
                  <span>{current.uploadDate}</span>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between border-t border-slate-300 pt-5">
                <div className="flex h-20 w-24 flex-col items-center justify-center rounded-full border-2 border-slate-500 p-1 text-[7px] font-semibold text-slate-600">
                  <span>OFFICIAL</span>
                  <span>TALUK SEAL</span>
                  <span>VERIFIED</span>
                </div>
                <div className="text-right">
                  <div className="mb-1 flex h-6 w-28 items-center justify-center border-b border-slate-400 text-[11px] italic text-slate-700">
                    Authorized sign
                  </div>
                  <span className="font-sans text-[9px] font-semibold text-slate-500">
                    Revenue officer endorsement
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Officer review */}
        <div className="xl:col-span-5 space-y-5">
          <Panel title="Case Details">
            <KeyValueList>
              <KeyValue label="Case ID">
                <span className="tnum">{current.id}</span>
              </KeyValue>
              <KeyValue label="Document type">{current.docType}</KeyValue>
              <KeyValue label="Location">
                {current.village}, {current.taluk}
              </KeyValue>
              <KeyValue label="District">{current.district}</KeyValue>
              <KeyValue label="Survey number">
                <span className="tnum">{current.surveyNo}</span>
              </KeyValue>
              <KeyValue label="Extent">{current.extent}</KeyValue>
              <KeyValue label="Document quality">{current.documentQuality}</KeyValue>
              <KeyValue label="Current status">
                <StatusBadge status={current.status} />
              </KeyValue>
            </KeyValueList>
          </Panel>

          <Panel title="AI-Assisted Findings" subtitle="Advisory only — the officer decides.">
            <p className="rounded-ctl border border-line bg-raised p-3.5 text-[12.5px] leading-relaxed text-ink-2">
              {current.findings.summary}
            </p>
            <dl className="mt-4 space-y-3">
              {findings.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[12px] font-medium text-ink">{label}</dt>
                  <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">{value}</dd>
                </div>
              ))}
            </dl>

            {current.officerNotes && (
              <div className="mt-4 rounded-ctl border border-line bg-raised p-3.5">
                <p className="text-[12px] font-medium text-ink">Officer remarks</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                  {current.officerNotes}
                </p>
                {current.reviewedAt && (
                  <p className="mt-1.5 text-[11.5px] text-ink-3">{current.reviewedAt}</p>
                )}
              </div>
            )}
          </Panel>

          <Panel
            title="Officer Decision"
            subtitle="Recorded against your officer ID and written to the audit trail."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Button
                variant="approve"
                icon={<Check size={14} strokeWidth={2.2} />}
                onClick={() => openDecision('Approved')}
              >
                Approve
              </Button>
              <Button
                variant="review"
                icon={<PenLine size={14} strokeWidth={2} />}
                onClick={() => openDecision('Needs Review')}
              >
                Manual Review
              </Button>
              <Button
                variant="reject"
                icon={<Flag size={14} strokeWidth={2} />}
                onClick={() => openDecision('Flagged')}
              >
                Reject
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={decision ? DECISION_COPY[decision].title : ''}
        subtitle={decision ? DECISION_COPY[decision].body : ''}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={
                decision === 'Approved' ? 'approve' : decision === 'Needs Review' ? 'review' : 'reject'
              }
              onClick={confirm}
            >
              {decision ? DECISION_COPY[decision].cta : ''}
            </Button>
          </>
        }
      >
        <p>
          Case <span className="tnum text-ink">{current.id}</span> · Survey No.{' '}
          <span className="tnum text-ink">{current.surveyNo}</span>, {current.village}.
        </p>

        <div className="mt-4">
          <Label>
            Officer note{' '}
            {decision !== 'Approved' && <span className="text-danger">(required)</span>}
          </Label>
          <TextArea
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (e.target.value.trim()) setNoteError('');
            }}
            placeholder="Basis for the decision — boundary variance, missing endorsement, referral reason."
          />
          {noteError && <p className="mt-1.5 text-[11.5px] text-danger">{noteError}</p>}
        </div>
      </Modal>
    </>
  );
}
