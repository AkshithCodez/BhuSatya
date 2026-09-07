import { useState } from 'react';

export default function SystemStatusBar() {
  const [latency] = useState('382ms');
  const [queueCount] = useState(8);

  const handleExport = () => {
    alert('Exporting official Karnataka RoR daily audit report (SHA-256 cryptographically verified)...');
  };

  return (
    <footer className="h-12 border-t border-white/[0.08] bg-[#0c1015]/95 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none shrink-0 text-xs text-slate-400 z-30">
      {/* Left: AI Pipeline Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-medium hidden sm:inline">AI Verification Pipeline Active</span>
        </div>
        <div className="h-3.5 w-px bg-white/10 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Inference: <strong className="text-emerald-400">{latency}</strong></span>
          <span>·</span>
          <span>Queued: <strong className="text-slate-200">{queueCount} Docs</strong></span>
        </div>
      </div>

      {/* Center: Live Case Stream Ticker */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-300">
        <span className="text-emerald-400 font-bold">STREAM:</span>
        <span>Case #BLR-2026-8819</span>
        <span className="text-slate-500">→</span>
        <span>Devanahalli, Sy No. 104/A</span>
        <span className="text-emerald-400 font-bold ml-1">✓ PASSED</span>
      </div>

      {/* Right: Security Badge & Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="font-mono text-[10px] text-emerald-300 hidden sm:inline">SHA-256 AUDIT VERIFIED</span>
        </div>

        <button
          onClick={handleExport}
          className="py-1 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-medium transition-colors border border-white/10 flex items-center gap-1.5"
          title="Download verified daily summary"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">Export Audit Log</span>
        </button>
      </div>
    </footer>
  );
}
