
export interface BhuSatyaLogoProps {
  /**
   * 'full': Full wordmark logo with the symbol and text.
   * 'mark': Standalone emblem symbol (geometric land parcel with checkmark).
   * 'symbol-text': Standalone emblem image paired with crisp adaptive typography.
   */
  variant?: 'full' | 'mark' | 'symbol-text';
  /**
   * Size presets or custom styling via className.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * 'dark': Logo rendered on dark surfaces (#0F1513, #0A0E0D).
   * 'light': Logo rendered on light surfaces (cream, white).
   * 'auto': Adapts via inherited color / neutral filters.
   */
  theme?: 'dark' | 'light' | 'auto';
  /**
   * Optional subtitle line (e.g. "Land Record Verification").
   */
  subtitle?: string;
  className?: string;
  alt?: string;
}

const SIZES = {
  xs: {
    mark: 'h-5 w-5',
    full: 'h-6',
    text: 'text-sm',
    sub: 'text-[9.5px]',
  },
  sm: {
    mark: 'h-7 w-7',
    full: 'h-8',
    text: 'text-base',
    sub: 'text-[10.5px]',
  },
  md: {
    mark: 'h-9 w-9',
    full: 'h-10',
    text: 'text-lg',
    sub: 'text-[11.5px]',
  },
  lg: {
    mark: 'h-12 w-12',
    full: 'h-13',
    text: 'text-2xl',
    sub: 'text-xs',
  },
  xl: {
    mark: 'h-16 w-16',
    full: 'h-18',
    text: 'text-3xl',
    sub: 'text-sm',
  },
};

export default function BhuSatyaLogo({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  subtitle,
  className = '',
  alt = 'BhuSatya',
}: BhuSatyaLogoProps) {
  const currentSize = SIZES[size] || SIZES.md;

  // Filter for dark mode to ensure dark forest green in the logo pop against dark backdrops
  const fullFilterClass =
    theme === 'dark'
      ? 'brightness-[1.5] contrast-[1.1] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      : theme === 'light'
      ? 'brightness-100 contrast-100'
      : '';

  if (variant === 'mark') {
    return (
      <img
        src="/bhusatya-mark.png"
        alt={alt}
        className={`inline-block object-contain select-none shrink-0 ${currentSize.mark} ${className}`}
        loading="eager"
      />
    );
  }

  if (variant === 'symbol-text') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <img
          src="/bhusatya-mark.png"
          alt=""
          className={`object-contain shrink-0 ${currentSize.mark}`}
          loading="eager"
        />
        <div className="flex flex-col text-left leading-none">
          <span
            className={`font-bold tracking-[-0.02em] ${currentSize.text} ${
              theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-[#0E382B]' : 'text-current'
            }`}
          >
            <span className={theme === 'dark' ? 'text-emerald-400' : 'text-[#0E382B]'}>Bhu</span>
            <span className={theme === 'dark' ? 'text-lime-300' : 'text-[#5C6E30]'}>Satya</span>
          </span>
          {subtitle && (
            <span
              className={`mt-1 font-medium tracking-tight opacity-75 ${currentSize.sub} ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Wordmark variant
  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <img
        src="/bhusatya-logo.png"
        alt={alt}
        className={`w-auto object-contain shrink-0 ${currentSize.full} ${fullFilterClass}`}
        loading="eager"
      />
      {subtitle && (
        <span
          className={`mt-1 font-medium tracking-tight opacity-75 ${currentSize.sub} ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
