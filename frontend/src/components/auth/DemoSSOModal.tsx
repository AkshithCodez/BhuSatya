interface DemoSSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function DemoSSOModal({ isOpen, onClose, onContinue }: DemoSSOModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#131b22] border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sso-modal-title"
      >
        {/* Emblem / Shield Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              MeriPehchaan / JanParichay
            </span>
            <h3 id="sso-modal-title" className="text-lg font-semibold text-white tracking-tight mt-1">
              National Single Sign-On (SSO)
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Government SSO integration is currently available in prototype/demo mode for the SIH 2026 evaluation.
        </p>

        {/* Mock verification certificate container */}
        <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target IdP:</span>
            <span className="text-slate-200 font-mono">gov.in-sso-gateway-v2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Authenticated Role:</span>
            <span className="text-emerald-400 font-medium">Revenue Officer (Karnataka Land Records)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Security Standard:</span>
            <span className="text-slate-200">SAML 2.0 / OAuth2 OpenID Connect</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07130b] font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 text-center"
          >
            Continue to Dashboard (Demo)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-medium transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
