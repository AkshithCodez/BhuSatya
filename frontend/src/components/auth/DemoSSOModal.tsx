import { useNavigate } from 'react-router-dom';

interface DemoSSOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoSSOModal({ isOpen, onClose }: DemoSSOModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinueWithSSO = () => {
    localStorage.setItem('token', 'bhusatya-sso-' + Date.now());
    localStorage.setItem('userId', '101');
    localStorage.setItem('userName', 'Rajesh Kumar');
    localStorage.setItem('userRole', 'Revenue Officer');
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="relative w-full max-w-md bg-[#161E1B] border border-white/[0.12] rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 space-y-4 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sso-modal-title"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto text-2xl">
          🏛️
        </div>

        <div>
          <h3 id="sso-modal-title" className="text-xl font-semibold text-white tracking-tight">
            Government Single Sign-On (SSO)
          </h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            MeriPehchaan / JanParichay Prototype
          </span>
        </div>

        <p className="text-sm text-[#94A39B] leading-relaxed">
          Government SSO integration is represented in demo mode for this prototype.
        </p>

        <div className="p-3.5 rounded-xl bg-[#0F1513] border border-white/[0.06] text-xs text-left space-y-1.5">
          <div className="flex justify-between text-[#94A39B]">
            <span>Authenticated Identity:</span>
            <span className="text-white font-medium">Rajesh Kumar</span>
          </div>
          <div className="flex justify-between text-[#94A39B]">
            <span>Department:</span>
            <span className="text-white">Karnataka Revenue Administration</span>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-[#94A39B] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinueWithSSO}
            className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shadow-sm"
          >
            Continue with Demo SSO
          </button>
        </div>
      </div>
    </div>
  );
}
