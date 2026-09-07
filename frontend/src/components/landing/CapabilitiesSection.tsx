const capabilities = [
  {
    title: 'Table Detection',
    desc: 'Identifies tabular boundaries and column structures within land documents, including khasra registers and mutation records.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeLinecap="round" />
      </svg>
    ),
    tag: 'Model 1',
  },
  {
    title: 'Signature Detection',
    desc: 'Detects and isolates official signatures, witness marks, and applicant endorsements across historical land deeds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17c1.5-2 3-3 4.5-1s2 3 3.5 1 2.5-4 4-2 2.5 3 4 1 2-3 2-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 7l-7 7-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </svg>
    ),
    tag: 'Model 1',
  },
  {
    title: 'Stamp Detection',
    desc: 'Recognises revenue stamps, administrative seals, and registration emblems with high-precision bounding boxes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 7v0M12 17v0M7 12h0M17 12h0" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
    tag: 'Model 1',
  },
];

export default function CapabilitiesSection() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="capabilities__inner">
        <p className="capabilities__eyebrow">Capabilities</p>
        <h2 className="capabilities__heading">
          What our <strong>AI detects</strong>
        </h2>

        <div className="capabilities__list">
          {capabilities.map((cap) => (
            <div key={cap.title} className="capabilities__item">
              <div className="capabilities__item-icon">{cap.icon}</div>
              <div className="capabilities__item-body">
                <h3 className="capabilities__item-title">{cap.title}</h3>
                <p className="capabilities__item-desc">{cap.desc}</p>
              </div>
              <span className="capabilities__item-tag">{cap.tag}</span>
            </div>
          ))}
        </div>

        <div className="capabilities__roadmap">
          <svg
            className="capabilities__roadmap-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
          <span>Structured table-text extraction is planned as the next model integration.</span>
        </div>
      </div>
    </section>
  );
}
