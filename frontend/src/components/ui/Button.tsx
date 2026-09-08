import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'approve' | 'review' | 'reject';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hi active:bg-accent-lo border border-transparent',
  secondary: 'bg-raised text-ink border border-line hover:bg-raised-2 hover:border-line-strong',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:text-ink hover:bg-white/5',
  approve: 'bg-ok/15 text-ok border border-ok/30 hover:bg-ok/25',
  review: 'bg-warn/15 text-warn border border-warn/30 hover:bg-warn/25',
  reject: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5',
  md: 'h-9 px-4 text-[13px] gap-2',
  lg: 'h-11 px-5 text-[13.5px] gap-2',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  block,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-ctl font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-45 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
