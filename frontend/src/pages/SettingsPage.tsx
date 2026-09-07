import { useState } from 'react';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(85);
  const [bilingual, setBilingual] = useState(true);
  const [autoHash, setAutoHash] = useState(true);

  return (
    <div className="max-w-3xl space-y-6 select-none">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            System Preferences
          </span>
          <span className="text-xs text-slate-500 font-mono">OFFICER CONFIG</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Portal &amp; Detection Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure model confidence cut-offs, jurisdictional filters, and notification settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Detection Sensitivity */}
        <div className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] space-y-3">
          <h3 className="text-sm font-semibold text-white">AI Detection Confidence Threshold</h3>
          <p className="text-xs text-slate-400">
            Detections scoring below this threshold will automatically be flagged for manual surveyor re-inspection.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <input
              type="range"
              min="50"
              max="99"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-1 accent-emerald-400 cursor-pointer"
            />
            <span className="w-16 text-right font-mono font-bold text-emerald-400 text-sm">
              {threshold}%
            </span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-5 rounded-2xl bg-[#11161d] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white">Automated Processing Rules</h3>
          
          <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
            <div>
              <p className="text-xs font-medium text-slate-200">Bilingual OCR Normalization</p>
              <p className="text-[11px] text-slate-400">Transliterate Kannada/Hindi names alongside Latin script.</p>
            </div>
            <input
              type="checkbox"
              checked={bilingual}
              onChange={(e) => setBilingual(e.target.checked)}
              className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-200">Instant Cryptographic Commit</p>
              <p className="text-[11px] text-slate-400">Generate SHA-256 hash immediately upon officer sign-off.</p>
            </div>
            <input
              type="checkbox"
              checked={autoHash}
              onChange={(e) => setAutoHash(e.target.checked)}
              className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => alert('Settings saved successfully.')}
            className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
