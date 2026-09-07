const capabilities = [
  {
    title: 'Table Detection',
    desc: 'Detects structured tabular regions from uploaded land documents, including khasra registers, mutation ledgers, and revenue records.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeLinecap="round" />
      </svg>
    ),
    badge: 'Structure Analysis',
  },
  {
    title: 'Text Detection',
    desc: 'Identifies and extracts visible textual content across varying print styles and historical typography for downstream processing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    badge: 'Content Extraction',
  },
  {
    title: 'Stamp Detection',
    desc: 'Detects official stamps/seals used in land and government records, verifying presence and geometric orientation.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 7v0M12 17v0M7 12h0M17 12h0" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
    badge: 'Official Seal',
  },
  {
    title: 'Signature Detection',
    desc: 'Identifies handwritten signatures for review and validation, isolating officer approvals and witness endorsements.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 17c1.5-2 3-3 4.5-1s2 3 3.5 1 2.5-4 4-2 2.5 3 4 1 2-3 2-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 7l-7 7-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </svg>
    ),
    badge: 'Endorsement',
  },
];

export default function CapabilitiesSection() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="capabilities__inner">
        <div className="capabilities__header">
          <p className="capabilities__eyebrow">Platform Capabilities</p>
          <h2 className="capabilities__heading">
            Intelligent detection across <strong>all document elements</strong>
          </h2>
          <p className="capabilities__subheading">
            Specialized computer vision models analyze scanned land documents to localize and categorize essential verification evidence.
          </p>
        </div>

        <div className="capabilities__grid">
          {capabilities.map((cap) => (
            <div key={cap.title} className="capabilities__card">
              <div className="capabilities__card-top">
                <div className="capabilities__card-icon">{cap.icon}</div>
                <span className="capabilities__card-badge">{cap.badge}</span>
              </div>
              <h3 className="capabilities__card-title">{cap.title}</h3>
              <p className="capabilities__card-desc">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
