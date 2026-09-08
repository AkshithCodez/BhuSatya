import type { ReactNode } from 'react';
import { TONES, toneForStatus, type Tone } from './tone';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/** Small pill — the only place pill shapes and status colour are allowed. */
export default function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11.5px] font-medium leading-none whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={toneForStatus(status)}>{status}</Badge>;
}
