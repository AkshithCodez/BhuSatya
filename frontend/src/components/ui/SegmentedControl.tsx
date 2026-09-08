interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Quiet filter tabs — used for list-page status filters. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-ctl border border-line bg-raised p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-7 rounded-[7px] px-3 text-[12.5px] font-medium whitespace-nowrap transition-colors ${
              active ? 'bg-raised-2 text-ink' : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`tnum ml-1.5 ${active ? 'text-ink-3' : 'text-ink-3/70'}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
