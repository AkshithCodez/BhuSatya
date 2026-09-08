import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  action?: { label: string; onClick: () => void };
  /** Exactly one card per row should set this — the single accent surface. */
  accent?: boolean;
}

/**
 * Summary metric card. Dark charcoal by default; the accent variant fills with
 * terracotta so a row of three has one focal point and no competing colour.
 */
export default function StatCard({
  icon,
  label,
  value,
  description,
  action,
  accent = false,
}: StatCardProps) {
  const shell = accent
    ? 'bg-accent border-accent-lo/50'
    : 'bg-panel border-line';

  return (
    <div className={`rounded-card border ${shell} p-5 flex flex-col`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[13px] font-medium ${accent ? 'text-white/85' : 'text-ink-2'}`}>
          {label}
        </span>
        <span
          className={`grid place-items-center h-8 w-8 rounded-ctl ${
            accent ? 'bg-white/15 text-white' : 'bg-raised text-ink-2'
          }`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`tnum mt-5 text-[34px] font-semibold leading-none tracking-[-0.03em] ${
          accent ? 'text-white' : 'text-ink'
        }`}
      >
        {value}
      </p>
      <p className={`mt-2.5 text-[12.5px] ${accent ? 'text-white/75' : 'text-ink-3'}`}>
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`mt-5 pt-4 -mx-5 px-5 border-t flex items-center gap-1.5 text-[12.5px] font-medium transition-colors ${
            accent
              ? 'border-white/15 text-white/85 hover:text-white'
              : 'border-line text-ink-2 hover:text-ink'
          }`}
        >
          {action.label}
          <ArrowRight size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
