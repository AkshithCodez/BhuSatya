import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/65"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full rounded-card border border-line bg-panel shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
        style={{ maxWidth: width }}
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">{title}</h3>
            {subtitle && <p className="mt-1 text-[12.5px] text-ink-3">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center h-7 w-7 rounded-ctl text-ink-3 hover:text-ink hover:bg-white/5 transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </header>

        <div className="px-5 pb-5 text-[13px] text-ink-2 leading-relaxed">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
