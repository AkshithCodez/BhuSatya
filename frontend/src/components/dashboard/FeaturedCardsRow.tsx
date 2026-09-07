import { useNavigate } from 'react-router-dom';

export default function FeaturedCardsRow() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'upload',
      title: 'Upload Land Record',
      subtitle: 'Add scanned land documents for AI-assisted processing',
      tag: 'PDF · TIFF · IMAGE',
      route: '/app/upload',
      accent: 'from-emerald-900/40 via-[#13231a]/60 to-[#0e1713]/80',
      border: 'border-emerald-500/25 hover:border-emerald-400/50',
      glow: 'group-hover:shadow-emerald-950/50',
      iconBadge: 'UPLOAD PIPELINE',
      visual: (
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
          {/* Stylized Land Document with Upload Pulse */}
          <div className="relative w-28 h-28 rounded-xl bg-gradient-to-br from-emerald-800/30 to-slate-900/80 border border-emerald-500/30 flex flex-col p-2.5 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <div className="flex justify-between items-center mb-1.5 border-b border-emerald-500/20 pb-1">
              <span className="text-[9px] font-mono text-emerald-400">SALE_DEED.PDF</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            {/* Document lines simulation */}
            <div className="space-y-1.5">
              <div className="h-1.5 w-3/4 rounded bg-emerald-400/30" />
              <div className="h-1.5 w-full rounded bg-white/10" />
              <div className="h-1.5 w-5/6 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[8px] text-emerald-300 font-mono">
                CADASTRE #104
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[#07130b] font-bold shadow-lg">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'analysis',
      title: 'Document Analysis',
      subtitle: 'Review detected tables, text, signatures, and stamps',
      tag: '4 DETECTORS ACTIVE',
      route: '/app/documents/demo-1',
      accent: 'from-[#172535]/50 via-[#101b26]/60 to-[#0c141c]/80',
      border: 'border-cyan-500/25 hover:border-cyan-400/50',
      glow: 'group-hover:shadow-cyan-950/50',
      iconBadge: 'AI DETECTION',
      visual: (
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
          {/* AI Bounding Box Inspection Visualizer */}
          <div className="relative w-32 h-28 rounded-xl bg-gradient-to-br from-slate-900 to-[#0e1722] border border-cyan-500/30 p-2 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            {/* Table Bounding Box */}
            <div className="absolute top-2 left-2 right-2 h-9 rounded border border-cyan-400/60 bg-cyan-500/10 p-1 flex items-center justify-between">
              <span className="text-[8px] font-mono text-cyan-300 font-semibold">TABLE 99.2%</span>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
              </div>
            </div>
            {/* Seal and Signature bounding boxes */}
            <div className="absolute bottom-2 left-2 w-12 h-10 rounded border border-emerald-400/60 bg-emerald-500/10 flex items-center justify-center">
              <span className="text-[7px] font-mono text-emerald-300 font-semibold text-center leading-tight">STAMP<br />99.5%</span>
            </div>
            <div className="absolute bottom-2 right-2 w-14 h-10 rounded border border-amber-400/60 bg-amber-500/10 flex items-center justify-center">
              <span className="text-[7px] font-mono text-amber-300 font-semibold text-center leading-tight">SIGN<br />98.7%</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cases',
      title: 'Verification Cases',
      subtitle: 'Review documents pending approval or manual validation',
      tag: '18 PENDING REVIEW',
      route: '/app/review-queue',
      accent: 'from-[#2b2716]/40 via-[#1e1b10]/60 to-[#12100a]/80',
      border: 'border-amber-500/25 hover:border-amber-400/50',
      glow: 'group-hover:shadow-amber-950/50',
      iconBadge: 'OFFICER ADJUDICATION',
      visual: (
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
          {/* Official Government Seal & Checklist */}
          <div className="relative w-28 h-28 rounded-xl bg-gradient-to-br from-amber-900/30 to-slate-900/80 border border-amber-500/30 flex flex-col items-center justify-center p-2.5 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center bg-amber-500/10 mb-2">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <span className="text-[9px] font-semibold text-amber-300 uppercase tracking-wider">OFFICER SIGN-OFF</span>
            <span className="text-[8px] text-slate-400">Section 14(A) RoR</span>
          </div>
        </div>
      ),
    },
    {
      id: 'records',
      title: 'Land Record Search',
      subtitle: 'Find land parcels, survey numbers, and ownership records',
      tag: 'GIS & RTC ARCHIVE',
      route: '/app/parcels',
      accent: 'from-[#1a202c]/50 via-[#121620]/60 to-[#0a0d14]/80',
      border: 'border-slate-400/25 hover:border-slate-300/50',
      glow: 'group-hover:shadow-slate-950/50',
      iconBadge: 'CADASTRAL LOOKUP',
      visual: (
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
          {/* Cadastral Parcel Map Visual */}
          <div className="relative w-28 h-28 rounded-xl bg-gradient-to-br from-slate-800/40 to-[#0c0f16] border border-slate-500/30 p-2 flex flex-col justify-between shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <div className="grid grid-cols-2 gap-1 h-14">
              <div className="rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[7px] font-mono text-emerald-300 font-bold">
                104/A
              </div>
              <div className="rounded bg-white/5 border border-white/10 flex items-center justify-center text-[7px] font-mono text-slate-400">
                104/B
              </div>
              <div className="rounded bg-white/5 border border-white/10 flex items-center justify-center text-[7px] font-mono text-slate-400">
                105/1
              </div>
              <div className="rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[7px] font-mono text-amber-300 font-bold">
                105/2
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-1 border-t border-white/10">
              <span>LAT: 12.9716°</span>
              <span className="text-emerald-400 font-bold">SEARCH</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 select-none">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => navigate(card.route)}
          className={`group relative rounded-2xl bg-gradient-to-b ${card.accent} border ${card.border} p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl flex flex-col justify-between backdrop-blur-xl overflow-hidden`}
        >
          {/* Top Tag & Category Badge */}
          <div className="flex items-center justify-between mb-3 z-10">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
              {card.iconBadge}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {card.tag}
            </span>
          </div>

          {/* Center Graphic */}
          <div className="my-2 z-10">
            {card.visual}
          </div>

          {/* Bottom Content & Navigation Arrow */}
          <div className="mt-2 z-10">
            <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {card.subtitle}
            </p>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                Launch Module
              </span>
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-emerald-500 group-hover:text-[#07130b] flex items-center justify-center text-white text-xs transition-all duration-300 transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
