import { useNavigate } from 'react-router-dom';

export default function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section className="final-cta">
      <div className="final-cta__inner">
        <div className="final-cta__badge">Government-Ready Infrastructure</div>
        <h2 className="final-cta__heading">
          Ready to modernize <strong>land-record verification?</strong>
        </h2>
        <p className="final-cta__subtext">
          Start using BhuSatya to digitize, detect, and review land documents with confidence.
        </p>

        <div className="final-cta__actions">
          <button
            className="final-cta__btn final-cta__btn--primary"
            onClick={() => navigate('/upload')}
          >
            Start Verification
          </button>
          <button
            className="final-cta__btn final-cta__btn--secondary"
            onClick={() => navigate('/login')}
          >
            Open Officer Portal
          </button>
          <a href="#how-it-works" className="final-cta__btn final-cta__btn--outline">
            Explore Workflow
          </a>
        </div>
      </div>
    </section>
  );
}
