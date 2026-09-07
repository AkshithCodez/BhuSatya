import { useNavigate } from 'react-router-dom';

export default function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        {/* Top grid */}
        <div className="landing-footer__grid">
          {/* Brand info */}
          <div className="landing-footer__brand-col">
            <div className="landing-footer__logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>BhuSatya</span>
            </div>
            <p className="landing-footer__tagline">
              Intelligent Land Record Digitization &amp; Validation System
            </p>
            <p className="landing-footer__mission">
              Built to support transparent, efficient, and intelligent land-record management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Platform</h4>
            <ul className="landing-footer__links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#capabilities">AI Capabilities</a></li>
              <li><a href="#about">About Platform</a></li>
              <li><button onClick={() => navigate('/upload')} className="landing-footer__link-btn">Start Verification</button></li>
              <li><button onClick={() => navigate('/login')} className="landing-footer__link-btn">Officer Portal</button></li>
            </ul>
          </div>

          {/* Capabilities */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Detection Features</h4>
            <ul className="landing-footer__links">
              <li><a href="#capabilities">Table Detection</a></li>
              <li><a href="#capabilities">Text Detection</a></li>
              <li><a href="#capabilities">Stamp Detection</a></li>
              <li><a href="#capabilities">Signature Detection</a></li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Governance &amp; Support</h4>
            <ul className="landing-footer__links">
              <li><span>Department of Land Resources</span></li>
              <li><span>Officer Helpdesk: support@bhusatya.gov.in</span></li>
              <li><span>Administrative Verification Standards</span></li>
              <li><span>Immutable Audit Logging Enabled</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & bar */}
        <div className="landing-footer__bottom-bar">
          <p className="landing-footer__copyright">
            © {new Date().getFullYear()} BhuSatya Platform. Designed for Intelligent Land Record Verification.
          </p>
          <div className="landing-footer__status">
            <span className="landing-footer__status-dot" />
            <span>AI Verification Engine Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
