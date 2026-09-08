import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Removes body padding — use when the panel holds a full-bleed table. */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
}

/**
 * The single card surface used across every internal page:
 * charcoal fill, soft border, consistent 12px radius, no glow.
 */
export default function Panel({
  title,
  subtitle,
  actions,
  children,
  flush = false,
  className = '',
  bodyClassName = '',
}: PanelProps) {
  const hasHeader = Boolean(title || actions);

  return (
    <section
      className={`rounded-card border border-line bg-panel overflow-hidden ${className}`}
    >
      {hasHeader && (
        <header
          className={`flex items-start justify-between gap-4 px-5 pt-5 ${flush ? 'pb-4' : 'pb-1'}`}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">{title}</h2>
            )}
            {subtitle && <p className="mt-1 text-[12.5px] text-ink-3">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={flush ? bodyClassName : `px-5 pb-5 ${hasHeader ? 'pt-4' : 'pt-5'} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
