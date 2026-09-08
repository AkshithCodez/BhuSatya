interface Bar {
  label: string;
  value: number;
}

interface BarChartProps {
  data: Bar[];
  /** Index of the single bar rendered in the accent colour. Defaults to the last. */
  accentIndex?: number;
  height?: number;
  unit?: string;
}

/** Vertical room reserved above each bar for its value label. */
const LABEL_ROW = 22;

/**
 * Plain CSS bar chart: flat gray bars, exactly one accent bar, no gradients,
 * no glow, no fake telemetry. Bar heights are resolved in pixels so the value
 * labels never compress the plot area.
 */
export default function BarChart({ data, accentIndex, height = 168, unit = '' }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const plot = Math.max(height - LABEL_ROW, 40);
  const focus = accentIndex ?? data.length - 1;

  return (
    <div>
      <div className="flex items-end gap-2.5" style={{ height }}>
        {data.map((d, i) => {
          const isFocus = i === focus;
          const barHeight = Math.max(Math.round((d.value / max) * plot), 4);
          return (
            <div key={d.label} className="group flex min-w-0 flex-1 flex-col justify-end">
              <span
                className={`tnum mb-2 text-center text-[12px] ${
                  isFocus ? 'text-accent-hi font-medium' : 'text-ink-3'
                }`}
              >
                {d.value.toLocaleString('en-IN')}
                {unit}
              </span>
              <div className="mx-auto w-full max-w-[64px]">
                <div
                  title={`${d.label}: ${d.value}${unit}`}
                  style={{ height: barHeight }}
                  className={`w-full rounded-[5px] transition-colors ${
                    isFocus ? 'bg-accent' : 'bg-[#333333] group-hover:bg-[#3d3d3d]'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-start gap-2.5 border-t border-line pt-3">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`min-w-0 flex-1 text-center text-[11.5px] leading-tight ${
              i === focus ? 'text-ink-2' : 'text-ink-3'
            }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
