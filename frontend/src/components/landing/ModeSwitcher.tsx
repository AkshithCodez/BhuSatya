export type HeroMode = 'digitize' | 'verify';

interface ModeSwitcherProps {
  mode: HeroMode;
  onModeChange: (mode: HeroMode) => void;
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="selector" role="tablist" aria-label="Hero mode selector">
      <div className="selector__container">
        <button
          role="tab"
          aria-selected={mode === 'digitize'}
          className={`selector__option ${mode === 'digitize' ? 'selector__option--active' : ''}`}
          onClick={() => onModeChange('digitize')}
        >
          <span className="selector__label">Digitize</span>
          <span className="selector__sublabel">Paper → Digital</span>
        </button>
        <button
          role="tab"
          aria-selected={mode === 'verify'}
          className={`selector__option ${mode === 'verify' ? 'selector__option--active' : ''}`}
          onClick={() => onModeChange('verify')}
        >
          <span className="selector__label">Verify</span>
          <span className="selector__sublabel">Detect → Validate</span>
        </button>

        {/* Sliding cream indicator */}
        <div
          className={`selector__indicator ${mode === 'verify' ? 'selector__indicator--right' : ''}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
