interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Row-level switch used in Settings. */
export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-line/70 last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[12px] text-ink-3">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? 'bg-accent border-accent-lo' : 'bg-raised border-line-strong'
        }`}
      >
        <span
          className={`absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[19px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}
