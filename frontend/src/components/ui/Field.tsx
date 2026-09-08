import { Search } from 'lucide-react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const CONTROL =
  'rounded-ctl border border-line bg-raised text-[13px] text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-accent/20 disabled:opacity-50';

/**
 * Controls fill their container by default, but Tailwind emits `.w-full` after
 * arbitrary widths — so a caller's `w-[210px]` would lose. Only add `w-full`
 * when the caller has not set a width of its own.
 */
function widthOf(className: string) {
  return /(^|\s)(w-|min-w-|max-w-)/.test(className) ? '' : 'w-full';
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-3">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${CONTROL} ${widthOf(className)} h-9 px-3 ${className}`} />;
}

export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`${CONTROL} ${widthOf(className)} px-3 py-2.5 resize-none ${className}`}
    />
  );
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`${CONTROL} ${widthOf(className)} h-9 pl-3 pr-8 appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%237c7c7c%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:15px_15px] bg-[position:right_9px_center] bg-no-repeat ${className}`}
    />
  );
}

export function SearchInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={14}
        strokeWidth={2}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
      />
      <input {...rest} className={`${CONTROL} w-full h-9 pl-[34px] pr-3`} />
    </div>
  );
}
