import { useNavigate } from 'react-router-dom';

export default function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section className="final-cta">
      <div className="final-cta__inner">
        <div className="flex justify-center mb-3">
          <img
            src="/bhusatya-mark.png"
            alt="BhuSatya"
            className="w-10 h-10 object-contain drop-shadow-md opacity-90"
          />
        </div>
        <div className="final-cta__badge">Government-Ready Infrastructure</div>
        <h2 className="final-cta__heading">
          Modernize <strong>Land Record Verification</strong>
        </h2>
        <p className="final-cta__subtext">
          Digitize, analyse and review land documents through one unified officer workflow.
        </p>

        <div className="final-cta__actions">
          <button
            className="final-cta__btn final-cta__btn--primary"
            onClick={() => navigate('/login')}
          >
            Open Officer Portal
          </button>
          <button
            className="final-cta__btn final-cta__btn--secondary"
            onClick={() => navigate('/upload')}
          >
            Start Verification
          </button>
          <a href="#how-it-works" className="final-cta__btn final-cta__btn--outline">
            Explore Workflow
          </a>
        </div>
      </div>
    </section>
  );
}
