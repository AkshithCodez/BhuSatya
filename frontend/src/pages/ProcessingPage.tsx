import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const STEPS = [
  'Uploaded',
  'Text Detection',
  'Table Detection',
  'Signature Detection',
  'Stamp Detection',
  'Preparing Review',
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const docName =
    sessionStorage.getItem('uploadedDocName') || 'Sale_Deed_Binnamangala_Sy104A.pdf';

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        setTimeout(() => navigate('/analysis'), 500);
        return prev;
      });
    }, 480);
    return () => clearInterval(interval);
  }, [navigate]);

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[68vh] items-center justify-center">
      <section className="w-full max-w-[420px] rounded-card border border-line bg-panel p-6">
        <h1 className="text-[16px] font-semibold text-ink tracking-[-0.01em]">
          Analyzing document
        </h1>
        <p className="mt-1 truncate text-[12.5px] text-ink-3">{docName}</p>

        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ol className="mt-5 space-y-1">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-ctl px-3 py-2.5 transition-colors ${
                  current ? 'bg-raised' : ''
                }`}
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center">
                  {done ? (
                    <Check size={13} strokeWidth={2.4} className="text-ok" />
                  ) : current ? (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                  )}
                </span>
                <span
                  className={`text-[13px] ${
                    current ? 'text-ink font-medium' : done ? 'text-ink-2' : 'text-ink-3'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
