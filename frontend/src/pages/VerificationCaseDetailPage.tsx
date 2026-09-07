import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, updateCaseStatus, type VerificationCase } from '../data/mockCases';

export default function VerificationCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  // Load case or fallback
  const caseData = getCaseById(caseId || 'BLR-2026-8819');
  const [currentCase, setCurrentCase] = useState<VerificationCase | undefined>(caseData);

  // Modal State
  const [confirmAction, setConfirmAction] = useState<'Approved' | 'Needs Review' | 'Flagged' | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [noteError, setNoteError] = useState('');

  if (!currentCase) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <p className="text-sm text-[#94A39B]">The requested case ID does not exist.</p>
        <button
          onClick={() => navigate('/verification')}
          className="py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-medium"
        >
          Return to Cases List
        </button>
      </div>
    );
  }

  const handleDecisionClick = (action: 'Approved' | 'Needs Review' | 'Flagged') => {
    setConfirmAction(action);
    setOfficerNote('');
    setNoteError('');
  };

  const handleConfirmDecision = () => {
    if ((confirmAction === 'Needs Review' || confirmAction === 'Flagged') && !officerNote.trim()) {
      setNoteError('Officer remarks/notes are required for this action.');
      return;
    }

    if (confirmAction) {
      const updated = updateCaseStatus(currentCase.id, confirmAction, officerNote.trim());
      if (updated) {
        setCurrentCase(updated);
      }
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: VerificationCase['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Needs Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Flagged':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Pending':
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('/verification')}
              className="text-xs text-[#94A39B] hover:text-white transition-colors"
            >
              Verification Cases
            </button>
            <span className="text-xs text-[#64756D]">/</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">{currentCase.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Case Adjudication Desk
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/analysis/${currentCase.id}`)}
            className="py-2 px-3.5 rounded-xl bg-[#161E1B] hover:bg-[#1E2824] text-[#F3F4F1] text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Inspect AI Detection Overlay →
          </button>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(currentCase.status)}`}>
            Status: {currentCase.status}
          </span>
        </div>
      </div>

      {/* 2-Panel Workspace: Left Document Preview / Right Officer Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Document Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-[#161E1B] border border-white/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <span className="text-xs font-semibold text-white">Document Preview</span>
              <span className="text-xs text-[#94A39B]">Page 1 of 2</span>
            </div>

            {/* Simulated Document Preview Container */}
            <div className="bg-[#fbf9f4] text-slate-900 rounded-xl p-6 shadow-md select-none border border-slate-300 min-h-[460px] text-xs font-serif leading-relaxed">
              <div className="text-center pb-3 border-b border-slate-400/60 mb-3">
                <p className="text-[9px] tracking-widest text-slate-600 uppercase">
                  GOVERNMENT OF KARNATAKA · REVENUE DEPARTMENT
                </p>
                <p className="font-bold text-sm text-slate-900 mt-0.5">
                  {currentCase.docType.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Survey No: {currentCase.surveyNo} · Extent: {currentCase.extent}
                </p>
              </div>

              <p className="mb-2">
                This official instrument confirms that <strong className="font-sans">{currentCase.ownerName}</strong> is
                registered as the titleholder for the parcel situated in <strong className="font-sans">{currentCase.village} Village</strong>,{' '}
                <strong className="font-sans">{currentCase.taluk} Taluk</strong>, <strong className="font-sans">{currentCase.district}</strong>.
              </p>

              <div className="my-3 p-3 bg-slate-100 rounded border border-slate-300 font-sans text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Document Type:</span>
                  <span className="font-semibold">{currentCase.docType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Survey Number:</span>
                  <span className="font-mono font-bold">Sy. {currentCase.surveyNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jurisdiction:</span>
                  <span>{currentCase.village}, {currentCase.taluk}, {currentCase.district}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between">
                <div className="w-24 h-20 border-2 border-purple-800 rounded-full flex flex-col items-center justify-center text-[7px] text-purple-900 font-bold p-1">
                  <span>OFFICIAL</span>
                  <span>TALUK SEAL</span>
                  <span>VERIFIED</span>
                </div>
                <div className="text-right">
                  <div className="w-28 h-6 border-b border-slate-400 italic text-[11px] text-blue-900 mb-1 flex items-center justify-center">
                    Authorized Sign
                  </div>
                  <span className="text-[9px] font-sans font-semibold text-slate-600">
                    Revenue Officer Endorsement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Officer Review & Decision Desk (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata & Case Details */}
          <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
              Case Particulars
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#94A39B]">Case ID</p>
                <p className="font-mono font-medium text-emerald-400 mt-0.5">{currentCase.id}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Document Type</p>
                <p className="font-medium text-white mt-0.5">{currentCase.docType}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">District &amp; Taluk</p>
                <p className="font-medium text-white mt-0.5">{currentCase.district}, {currentCase.taluk}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Village &amp; Survey</p>
                <p className="font-medium text-white mt-0.5">{currentCase.village} · Sy. {currentCase.surveyNo}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Upload Date</p>
                <p className="text-white mt-0.5">{currentCase.uploadDate}</p>
              </div>
              <div>
                <p className="text-[#94A39B]">Document Quality</p>
                <p className="text-emerald-400 font-medium mt-0.5">{currentCase.documentQuality}</p>
              </div>
            </div>
          </div>

          {/* AI-Assisted Findings */}
          <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-3.5">
            <h2 className="text-base font-semibold text-white">AI-Assisted Findings</h2>

            <div className="p-3 rounded-xl bg-[#0F1513] border border-white/[0.06] text-xs text-[#94A39B] leading-relaxed">
              <span className="font-medium text-white block mb-1">Evidentiary Summary:</span>
              {currentCase.findings.summary}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0 font-bold">•</span>
                <span className="text-[#94A39B]"><strong className="text-slate-200">Text Detected:</strong> {currentCase.findings.textDetected}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0 font-bold">•</span>
                <span className="text-[#94A39B]"><strong className="text-slate-200">Tables Detected:</strong> {currentCase.findings.tablesDetected}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0 font-bold">•</span>
                <span className="text-[#94A39B]"><strong className="text-slate-200">Signature Detected:</strong> {currentCase.findings.signatureDetected}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0 font-bold">•</span>
                <span className="text-[#94A39B]"><strong className="text-slate-200">Stamp Detected:</strong> {currentCase.findings.stampDetected}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 shrink-0 font-bold">•</span>
                <span className="text-[#94A39B]"><strong className="text-slate-200">Potential Inconsistencies:</strong> {currentCase.findings.inconsistencies}</span>
              </div>
            </div>

            {currentCase.officerNotes && (
              <div className="p-3 rounded-xl bg-[#1E2824] border border-emerald-500/20 text-xs">
                <span className="font-medium text-emerald-300 block mb-1">Recorded Officer Remarks:</span>
                <p className="text-slate-200">{currentCase.officerNotes}</p>
                {currentCase.reviewedAt && (
                  <p className="text-[10px] text-[#94A39B] mt-1">{currentCase.reviewedAt}</p>
                )}
              </div>
            )}
          </div>

          {/* Officer Decision Buttons */}
          <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-3">
            <h2 className="text-base font-semibold text-white">Officer Decision</h2>
            <p className="text-xs text-[#94A39B]">
              The authorized revenue officer makes the final legal determination on land documents.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => handleDecisionClick('Approved')}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm"
              >
                ✓ Approve
              </button>

              <button
                onClick={() => handleDecisionClick('Needs Review')}
                className="py-2.5 px-3 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-white font-medium text-xs transition-colors"
              >
                Manual Review
              </button>

              <button
                onClick={() => handleDecisionClick('Flagged')}
                className="py-2.5 px-3 rounded-xl bg-rose-700/80 hover:bg-rose-600 text-white font-medium text-xs transition-colors"
              >
                Flag / Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161E1B] border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-semibold text-white">
                Confirm Officer Decision: {confirmAction}
              </h3>
              <button
                onClick={() => setConfirmAction(null)}
                className="text-[#94A39B] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#94A39B] leading-relaxed">
              You are about to record the decision for Case{' '}
              <strong className="text-white font-mono">{currentCase.id}</strong> (Survey No.{' '}
              {currentCase.surveyNo}, {currentCase.village}).
            </p>

            {/* Note field required for Review or Flag */}
            {(confirmAction === 'Needs Review' || confirmAction === 'Flagged') && (
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">
                  Officer Remarks / Basis for Action <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={officerNote}
                  onChange={(e) => {
                    setOfficerNote(e.target.value);
                    if (e.target.value.trim()) setNoteError('');
                  }}
                  placeholder="Enter details of boundary variance, missing stamp, or referral reason..."
                  className="w-full p-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-white placeholder-[#64756D] focus:outline-none focus:border-emerald-500/40"
                />
                {noteError && (
                  <p className="text-[11px] text-rose-400 mt-1">{noteError}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setConfirmAction(null)}
                className="py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-[#94A39B] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`py-2 px-4 rounded-xl text-xs font-medium text-white transition-colors ${
                  confirmAction === 'Approved'
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : confirmAction === 'Needs Review'
                    ? 'bg-amber-700 hover:bg-amber-600'
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}
              >
                Confirm &amp; Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
