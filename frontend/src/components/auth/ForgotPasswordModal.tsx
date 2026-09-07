interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-[#161E1B] border border-white/[0.12] rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h3 id="forgot-password-title" className="text-xl font-semibold text-white tracking-tight">
          Officer Password Recovery
        </h3>
        
        <p className="text-sm text-[#94A39B] leading-relaxed">
          Password recovery for officer accounts is managed by the authorized department administrator.
          Please contact your system administrator or designated land-record officer to recover access.
        </p>

        <div className="p-4 rounded-xl bg-[#0F1513] border border-white/[0.06] text-xs space-y-2">
          <div className="flex justify-between items-center text-[#94A39B]">
            <span>Authorized Authority:</span>
            <span className="text-white font-medium">State Revenue Administration Desk</span>
          </div>
          <div className="flex justify-between items-center text-[#94A39B]">
            <span>Administrator Email:</span>
            <span className="text-emerald-400 font-mono">admin@bhusatya.gov.in</span>
          </div>
          <div className="flex justify-between items-center text-[#94A39B]">
            <span>Toll-Free Helpline:</span>
            <span className="text-white font-mono">1800-425-BHUMI (24864)</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => alert('Support ticket raised. The department administrator has been notified.')}
            className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#94A39B] hover:text-white text-xs font-medium transition-colors"
          >
            Contact Administrator
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shadow-sm"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
