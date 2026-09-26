import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { detectLayout } from '../api/client';

const STEPS = [
  'Document Uploaded to Database',
  'Initializing YOLOv8n Layout Detector',
  'Table Region Detection',
  'Signature Region Detection',
  'Stamp Region Detection',
  'Saving Evidentiary Regions to Database',
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const docIdParam = searchParams.get('docId') || sessionStorage.getItem('currentDocId');
  const docName =
    sessionStorage.getItem('uploadedDocName') || 'Sale_Deed_Binnamangala_Sy104A.pdf';

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Timer that advances steps visually
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    const runPipeline = async () => {
      try {
        if (docIdParam) {
          // Real backend layout detection
          await detectLayout(Number(docIdParam));
        }
        clearInterval(stepInterval);
        setStep(STEPS.length - 1);
        setTimeout(() => {
          navigate(docIdParam ? `/analysis?docId=${docIdParam}` : '/analysis');
        }, 600);
      } catch (err: any) {
        console.error('Detection pipeline failed:', err);
        setError(err?.response?.data?.detail || err.message || 'Detection failed');
        clearInterval(stepInterval);
        // If error, still allow user to navigate to analysis review or inspect error
        setTimeout(() => {
          navigate(docIdParam ? `/analysis?docId=${docIdParam}` : '/analysis');
        }, 1200);
      }
    };

    runPipeline();

    return () => clearInterval(stepInterval);
  }, [navigate, docIdParam]);

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[68vh] items-center justify-center">
      <section className="w-full max-w-[440px] rounded-card border border-line bg-panel p-6 shadow-xl">
        <h1 className="text-[16px] font-semibold text-ink tracking-[-0.01em]">
          Analyzing Document
        </h1>
        <p className="mt-1 truncate text-[12.5px] text-ink-3">{docName}</p>

        {docIdParam && (
          <span className="mt-1 inline-block text-[11px] font-mono text-accent-hi">
            PostgreSQL Document ID: #{docIdParam}
          </span>
        )}

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
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
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

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-ctl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-300">
            <AlertCircle size={14} className="shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
        )}
      </section>
    </div>
  );
}
