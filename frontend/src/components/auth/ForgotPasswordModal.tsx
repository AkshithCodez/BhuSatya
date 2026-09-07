interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#131b22] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        {/* Shield Header Icon */}
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h3 id="forgot-password-title" className="text-xl font-semibold text-white tracking-tight">
          Credential Recovery Protocol
        </h3>
        
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Password reset is managed by your department administrator. Please contact your authorized land records officer or system administrator for credential recovery.
        </p>

        {/* Official administrative help desk block */}
        <div className="mt-5 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Nodal Authority:</span>
            <span className="text-slate-200 font-medium">Department of Land Governance</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Officer Helpdesk:</span>
            <span className="text-emerald-400 font-mono">support@bhusatya.gov.in</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Direct Line:</span>
            <span className="text-slate-200 font-mono">+91 (080) 2203-LAND</span>
          </div>
        </div>

        {/* Demo Credentials Tip for Evaluators */}
        <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
          <strong>SIH Hackathon Evaluation Note:</strong> You can instantly log in using demo credentials: <span className="font-mono underline">officer@bhusatya.gov</span> with password <span className="font-mono underline">demo123</span>.
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07130b] font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
