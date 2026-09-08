import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** The identical heading block that opens every internal page. */
export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold text-ink tracking-[-0.02em] leading-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[13px] text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
