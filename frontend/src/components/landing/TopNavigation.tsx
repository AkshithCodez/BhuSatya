import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'About', href: '#about' },
];

export default function TopNavigation() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav className="topnav" role="navigation" aria-label="Main navigation">
        <div className="topnav__inner">
          {/* Logo */}
          <a href="/" className="topnav__logo" aria-label="BhuSatya Home">
            <img
              src="/bhusatya-mark.png"
              alt=""
              className="w-7 h-7 object-contain shrink-0 drop-shadow-sm"
              loading="eager"
            />
            <span className="topnav__logo-text">BhuSatya</span>
          </a>

          {/* Center Links (desktop) */}
          <div className="topnav__links">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="topnav__link">
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions (desktop) */}
          <div className="topnav__actions">
            <button
              className="topnav__portal"
              onClick={() => navigate('/login')}
            >
              Officer Portal
            </button>
            <button
              className="topnav__cta"
              onClick={() => navigate('/upload')}
            >
              Start Verification
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className={`topnav__hamburger ${mobileOpen ? 'topnav__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="topnav__hamburger-line" />
            <span className="topnav__hamburger-line" />
            <span className="topnav__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`topnav__mobile-overlay ${mobileOpen ? 'topnav__mobile-overlay--open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="topnav__mobile-link"
            onClick={closeMobile}
          >
            {link.label}
          </a>
        ))}
        <button
          className="topnav__mobile-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            closeMobile();
            navigate('/login');
          }}
        >
          Officer Portal
        </button>
        <button
          className="topnav__mobile-cta"
          onClick={() => {
            closeMobile();
            navigate('/upload');
          }}
        >
          Start Verification
        </button>
      </div>
    </>
  );
}
