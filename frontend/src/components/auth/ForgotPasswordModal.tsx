import { useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [raised, setRaised] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    setRaised(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div
        className="relative w-full max-w-md space-y-4 rounded-card border border-line-strong bg-panel p-6 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-ctl border border-accent-lo/40 bg-accent/12 text-accent-hi">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div>
          <h3
            id="forgot-password-title"
            className="text-[19px] font-semibold tracking-[-0.02em] text-ink"
          >
            Officer Password Recovery
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
            Password recovery for officer accounts is managed by the authorized department
            administrator. Contact your system administrator to have access restored.
          </p>
        </div>

        <div className="space-y-2 rounded-ctl border border-line bg-raised px-4 py-3.5 text-[12px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">Authorized authority</span>
            <span className="text-right text-ink">State Revenue Administration Desk</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">Administrator email</span>
            <span className="text-ink">admin@bhusatya.gov.in</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">Toll-free helpline</span>
            <span className="tnum text-ink">1800-425-24864</span>
          </div>
        </div>

        {raised && (
          <p className="text-[12px] text-ok">
            Support request logged. The department administrator has been notified.
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setRaised(true)}
            disabled={raised}
            className="rounded-ctl border border-line-strong bg-raised px-4 py-2.5 text-[12px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-raised-2 hover:text-ink disabled:opacity-50"
          >
            {raised ? 'Request sent' : 'Contact administrator'}
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-ctl bg-accent px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-accent-hi"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
