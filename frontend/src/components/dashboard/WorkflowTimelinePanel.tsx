import { useState, useEffect } from 'react';

export default function WorkflowTimelinePanel() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadPos, setPlayheadPos] = useState(48); // % along timeline
  const [activeCase] = useState('BLR-2026-8819');
  const [soloTrack, setSoloTrack] = useState<string | null>(null);

  // Simulation timer for the playhead scrubber line
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayheadPos((prev) => (prev >= 95 ? 5 : prev + 0.8));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const tracks = [
    {
      id: 'text',
      name: 'Text Detection',
      sub: 'Bilingual OCR',
      confidence: '98.4%',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      trackColor: 'from-cyan-600/40 via-cyan-500/30 to-cyan-700/40 border-cyan-400/40',
      tag: 'PARAGRAPH & TYPOGRAPHY',
      blocks: [
        { start: '5%', width: '30%', text: 'Owner: Basavaraj K.' },
        { start: '40%', width: '25%', text: 'Village: Devanahalli' },
        { start: '70%', width: '22%', text: 'RTC #8819/2026' },
      ],
    },
    {
      id: 'table',
      name: 'Table Detection',
      sub: 'Structural Grid',
      confidence: '99.2%',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      trackColor: 'from-emerald-600/40 via-emerald-500/30 to-emerald-700/40 border-emerald-400/40',
      tag: 'KHASRA MATRIX PARSING',
      blocks: [
        { start: '10%', width: '45%', text: 'Parcel Schedule Table (18 Cells)' },
        { start: '60%', width: '32%', text: 'Revenue Tax Ledger #4' },
      ],
    },
    {
      id: 'signature',
      name: 'Signature Detection',
      sub: 'Officer Sign-Off',
      confidence: '98.7%',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      trackColor: 'from-amber-600/40 via-amber-500/30 to-amber-700/40 border-amber-400/40',
      tag: 'EXECUTIVE ENDORSEMENT',
      blocks: [
        { start: '35%', width: '28%', text: 'Sub-Registrar Endorsement' },
        { start: '72%', width: '20%', text: 'Surveyor Sign-off' },
      ],
    },
    {
      id: 'stamp',
      name: 'Stamp Detection',
      sub: 'Jurisdictional Seal',
      confidence: '99.5%',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      trackColor: 'from-emerald-700/40 via-teal-600/30 to-emerald-800/40 border-emerald-400/40',
      tag: 'GOVT. EMBLEM VERIFIED',
      blocks: [
        { start: '20%', width: '35%', text: 'Official Taluk Seal (Verified)' },
        { start: '65%', width: '28%', text: 'E-Stamp Watermark #KA-09' },
      ],
    },
  ];

  return (
    <div className="rounded-2xl bg-[#11161d]/85 border border-white/10 p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl select-none overflow-hidden">
      {/* ─── Top Control Header (Matches DAW transport & project title) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xs">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Document Pipeline Visualizer
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                CASE #{activeCase}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time multi-lane detection confidence and stage latency
            </p>
          </div>
        </div>

        {/* Playback Simulation Buttons (Matches DAW controls in reference) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlayheadPos(5)}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 flex items-center justify-center text-xs"
            title="Reset Scrubber"
          >
            ⏮
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500 text-slate-950'
            }`}
          >
            <span>{isPlaying ? '⏸ Pause' : '▶ Simulate'}</span>
          </button>
          <button
            onClick={() => setPlayheadPos((p) => Math.min(95, p + 10))}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 flex items-center justify-center text-xs"
            title="Step Forward"
          >
            ⏭
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] font-mono text-slate-400">
            {playheadPos.toFixed(1)}% INFERRED
          </span>
        </div>
      </div>

      {/* ─── Timeline Ruler (Numbers 0s, 0.5s, 1.0s, 1.5s, 2.0s, etc.) ─── */}
      <div className="relative flex items-center text-[10px] font-mono text-slate-500 pt-2 pb-1 border-b border-white/[0.04]">
        <div className="w-36 shrink-0 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
          DETECTION LANE
        </div>
        <div className="flex-1 flex justify-between pr-4">
          <span>0.0s</span>
          <span>0.4s</span>
          <span>0.8s</span>
          <span>1.2s</span>
          <span>1.6s</span>
          <span>2.0s</span>
          <span>2.4s</span>
        </div>
      </div>

      {/* ─── Multitrack Processing Lanes ─── */}
      <div className="relative my-2 space-y-2">
        {/* Scrubber Playhead Line (Animates across tracks) */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-emerald-400 z-20 pointer-events-none shadow-[0_0_8px_rgba(74,222,128,0.8)]"
          style={{ left: `calc(9rem + (100% - 9rem) * ${playheadPos / 100})` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 -translate-x-[4px] -translate-y-1 shadow-md" />
        </div>

        {tracks.map((track) => {
          const isDimmed = soloTrack !== null && soloTrack !== track.id;
          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 transition-opacity duration-200 ${
                isDimmed ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {/* Lane Header (Icon, Name, M/S Solo/Mute) */}
              <div className="w-36 shrink-0 flex items-center justify-between p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{track.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono truncate">{track.confidence}</p>
                </div>
                {/* Mute / Solo toggle buttons (matches reference DAW buttons) */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setSoloTrack(soloTrack === track.id ? null : track.id)}
                    className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                      soloTrack === track.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Solo this lane"
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Lane Content Bar with Process Blocks */}
              <div className="flex-1 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] relative overflow-hidden flex items-center">
                {/* Subtle vertical gridlines matching reference timeline */}
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-px h-full bg-white" />
                  ))}
                </div>

                {/* Processing Blocks (Styled like audio waveform chunks) */}
                {track.blocks.map((b, i) => (
                  <div
                    key={i}
                    className={`absolute h-7 rounded-lg bg-gradient-to-r ${track.trackColor} border flex items-center px-2.5 shadow-sm text-[10px] font-medium text-slate-100 truncate cursor-pointer hover:brightness-125 transition-all`}
                    style={{ left: b.start, width: b.width }}
                  >
                    <span className="truncate">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Status Bar ─── */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Inference Pipeline: 4 Elements Co-Segmented</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Overall Match: <strong className="text-emerald-400">99.1%</strong></span>
          <span className="font-mono text-[10px] text-slate-500">Latency: 382ms</span>
        </div>
      </div>
    </div>
  );
}
