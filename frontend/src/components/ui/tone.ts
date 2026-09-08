export type Tone = 'ok' | 'warn' | 'danger' | 'neutral' | 'accent';

export const TONES: Record<Tone, string> = {
  ok: 'bg-ok/12 text-ok border-ok/25',
  warn: 'bg-warn/12 text-warn border-warn/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
  neutral: 'bg-white/6 text-ink-2 border-line-strong',
  accent: 'bg-accent/12 text-accent-hi border-accent/25',
};

/** Maps every status string used in the mock data onto one muted tone. */
export function toneForStatus(status: string): Tone {
  switch (status) {
    case 'Approved':
    case 'Verified':
    case 'Success':
    case 'Completed':
      return 'ok';
    case 'Needs Review':
    case 'Under Review':
    case 'Pending':
    case 'Warning':
      return 'warn';
    case 'Flagged':
    case 'Rejected':
    case 'Failed':
      return 'danger';
    default:
      return 'neutral';
  }
}
