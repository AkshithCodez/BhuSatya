import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  'Document Uploaded',
  'Preparing Document',
  'Text Detection',
  'Table Detection',
  'Signature Detection',
  'Stamp Detection',
  'Preparing Review',
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const docName =
    sessionStorage.getItem('uploadedDocName') || 'Sale_Deed_Binnamangala_Sy104A.pdf';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/analysis');
          }, 450);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#161E1B] border border-white/[0.08] shadow-xl space-y-6 text-center">
        {/* Animated Document Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Analyzing Land Record
          </h1>
          <p className="text-xs text-[#94A39B] mt-1 truncate">
            {docName}
          </p>
        </div>

        {/* Clean Step Progress List */}
        <div className="text-left space-y-2.5 pt-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#1E2824] text-white border border-emerald-500/30'
                    : isDone
                    ? 'text-slate-300'
                    : 'text-[#64756D]'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#64756D]" />
                  )}
                </div>
                <span className="text-xs font-medium">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
