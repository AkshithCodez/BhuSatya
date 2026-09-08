import type { ReactNode } from 'react';

/** Label / value rows used on every detail page. */
export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-line/70 last:border-0">
      <span className="text-[12.5px] text-ink-3 shrink-0">{label}</span>
      <span className="text-[13px] text-ink text-right min-w-0">{children}</span>
    </div>
  );
}

export function KeyValueList({ children }: { children: ReactNode }) {
  return <div className="-mt-2.5">{children}</div>;
}
