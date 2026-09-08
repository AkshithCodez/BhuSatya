import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

/**
 * Table shell shared by every list page: horizontal scroll only when needed,
 * quiet header row, hairline separators, comfortable 52px rows.
 */
export function Table({ children, minWidth = 860 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-slim">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-y border-line bg-white/[0.015]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({
  children,
  align = 'left',
  className = '',
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      {...rest}
      className={`px-5 py-3 text-[12px] font-medium text-ink-3 whitespace-nowrap ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-line/70 last:border-0 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-white/[0.025]' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  align = 'left',
  className = '',
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      {...rest}
      className={`px-5 py-[15px] text-[13px] text-ink-2 align-middle ${alignment} ${className}`}
    >
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-[13px] text-ink-3">
        {message}
      </td>
    </tr>
  );
}
