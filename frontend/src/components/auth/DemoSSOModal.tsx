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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div
        className="relative w-full max-w-md space-y-4 rounded-card border border-line-strong bg-panel p-6 text-center shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sso-modal-title"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-raised shadow-inner">
          <img
            src="/bhusatya-mark.png"
            alt="BhuSatya"
            className="h-10 w-10 object-contain drop-shadow-sm"
          />
        </div>

        <div>
          <h3 id="sso-modal-title" className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Government Single Sign-On
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
            MeriPehchaan integration is represented in demo mode for this prototype.
          </p>
        </div>

        <div className="space-y-2 rounded-ctl border border-line bg-raised px-4 py-3.5 text-left text-[12px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">Authenticated identity</span>
            <span className="text-ink">Rajesh Kumar</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">Department</span>
            <span className="text-right text-ink">Karnataka Revenue Administration</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-ctl border border-line-strong bg-raised px-4 py-2.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-raised-2 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinueWithSSO}
            className="rounded-ctl bg-accent px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-accent-hi"
          >
            Continue with Demo SSO
          </button>
        </div>
      </div>
    </div>
  );
}
