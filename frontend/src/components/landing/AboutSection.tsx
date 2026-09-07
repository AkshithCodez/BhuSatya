export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        {/* Header */}
        <div className="about__header">
          <p className="about__eyebrow">About BhuSatya</p>
          <h2 className="about__heading">
            Purpose-built for <strong>trusted land governance</strong>
          </h2>
          <p className="about__lead">
            BhuSatya is an intelligent land-record digitization and validation platform designed to
            assist officers in processing, analyzing, and reviewing land documents more efficiently.
            It helps organize scanned records and detect essential document elements such as tables,
            text, signatures, and stamps, improving speed, transparency, and consistency in document handling.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="about__grid">
          <div className="about__card">
            <div className="about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="about__card-title">Evidence-Preserved Digitization</h3>
            <p className="about__card-desc">
              Every legacy deed, khasra register, and mutation record is converted into an archival-grade
              digital asset with original resolution, visual bounding coordinates, and cryptographic audit hashes intact.
            </p>
          </div>

          <div className="about__card">
            <div className="about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="about__card-title">Automated Element Detection</h3>
            <p className="about__card-desc">
              High-precision computer vision isolates structured tabular parcels, text regions, official
              revenue stamps, and executive signatures in milliseconds, reducing manual transcription effort.
            </p>
          </div>

          <div className="about__card">
            <div className="about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="about__card-title">Officer-in-the-Loop Governance</h3>
            <p className="about__card-desc">
              AI provides evidentiary assistance, not autonomous adjudication. Authorized revenue officers
              retain complete supervisory control with side-by-side document validation tools.
            </p>
          </div>
        </div>

        {/* Highlight Banner / Stat Row */}
        <div className="about__stats">
          <div className="about__stat">
            <span className="about__stat-number">4 Key</span>
            <span className="about__stat-label">Document Elements Detected</span>
          </div>
          <div className="about__stat-sep" />
          <div className="about__stat">
            <span className="about__stat-number">Sub-Second</span>
            <span className="about__stat-label">Element Inference Time</span>
          </div>
          <div className="about__stat-sep" />
          <div className="about__stat">
            <span className="about__stat-number">100%</span>
            <span className="about__stat-label">Immutable Audit Trail</span>
          </div>
        </div>
      </div>
    </section>
  );
}
