const steps = [
  {
    num: '01',
    title: 'Upload Document',
    desc: 'Upload a scanned land deed, registry, or cadastral record in PDF, TIFF, or high-res image format.',
  },
  {
    num: '02',
    title: 'Automated Detection',
    desc: 'AI isolates and detects structured tables, text regions, official stamps, and signatures in seconds.',
  },
  {
    num: '03',
    title: 'Officer Review & Validation',
    desc: 'Detected evidence is presented side-by-side for assisted verification, officer sign-off, and audit logging.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="hiw" id="how-it-works">
      {/* Anchor for Workflow link */}
      <div id="workflow" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />

      <div className="hiw__inner">
        <div className="hiw__header">
          <p className="hiw__eyebrow">Verification Workflow</p>
          <h2 className="hiw__heading">
            Three steps to <strong>verified land records</strong>
          </h2>
          <p className="hiw__lead">
            An end-to-end assisted workflow designed to accelerate administrative reviews without compromising evidentiary integrity.
          </p>
        </div>

        <div className="hiw__steps">
          {steps.map((step) => (
            <div key={step.num} className="hiw__step">
              <div className="hiw__step-top">
                <span className="hiw__step-num">{step.num}</span>
                <span className="hiw__step-indicator" />
              </div>
              <div className="hiw__step-divider" />
              <h3 className="hiw__step-title">{step.title}</h3>
              <p className="hiw__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
