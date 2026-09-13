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
              <img
                src="/bhusatya-mark.png"
                alt="BhuSatya"
                className="w-7 h-7 object-contain shrink-0 drop-shadow-sm"
              />
              <span>BhuSatya</span>
            </div>
            <p className="landing-footer__tagline">
              Intelligent Land Record Digitization &amp; Validation System
            </p>
            <p className="landing-footer__mission">
              Supporting transparent, efficient and intelligent land-record management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Quick Links</h4>
            <ul className="landing-footer__links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#capabilities">AI Detection Capabilities</a></li>
              <li><a href="#about">About BhuSatya</a></li>
              <li><button onClick={() => navigate('/upload')} className="landing-footer__link-btn">Start Verification</button></li>
              <li><button onClick={() => navigate('/login')} className="landing-footer__link-btn">Officer Portal</button></li>
            </ul>
          </div>

          {/* Detection Features */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Detection Capabilities</h4>
            <ul className="landing-footer__links">
              <li><a href="#capabilities">Text Detection</a></li>
              <li><a href="#capabilities">Table Detection</a></li>
              <li><a href="#capabilities">Stamp Detection</a></li>
              <li><a href="#capabilities">Signature Detection</a></li>
            </ul>
          </div>

          {/* Support & Governance */}
          <div className="landing-footer__nav-col">
            <h4 className="landing-footer__col-title">Support &amp; Privacy</h4>
            <ul className="landing-footer__links">
              <li><span>Department of Land Governance</span></li>
              <li><span>Officer Helpdesk: support@bhusatya.gov.in</span></li>
              <li><span>Toll Free: 1800-425-BHUMI</span></li>
              <li><span>Privacy &amp; Data Sovereign Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & bar */}
        <div className="landing-footer__bottom-bar">
          <p className="landing-footer__copyright">
            © {new Date().getFullYear()} BhuSatya. Supporting transparent, efficient and intelligent land-record management.
          </p>
          <div className="landing-footer__status">
            <span className="landing-footer__status-dot" />
            <span>Operational · State Revenue Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
