import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/client';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import DemoSSOModal from '../components/auth/DemoSSOModal';
import heroNight from '../assets/bhusatya-hero-night.jpg';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('officer@bhusatya.gov');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'officer' | 'operator'>('officer');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const navigate = useNavigate();

  const handleDemoFill = (role: 'officer' | 'operator') => {
    setActiveRole(role);
    setError('');
    if (role === 'officer') {
      setEmail('officer@bhusatya.gov');
      setPassword('demo123');
    } else {
      setEmail('operator@sih.demo');
      setPassword('demo123');
    }
  };

  const handleSuccessfulAuth = (name: string, role: string) => {
    localStorage.setItem('token', 'bhusatya-auth-' + Date.now());
    localStorage.setItem('userId', '101');
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Working Demo Credentials
    if (
      (trimmedEmail === 'officer@bhusatya.gov' || trimmedEmail === 'officer@sih.demo') &&
      password === 'demo123'
    ) {
      setTimeout(() => {
        handleSuccessfulAuth('Officer Ananya Sharma', 'revenue_officer');
      }, 350);
      return;
    }

    if (
      (trimmedEmail === 'operator@sih.demo' || trimmedEmail === 'operator@bhusatya.gov') &&
      password === 'demo123'
    ) {
      setTimeout(() => {
        handleSuccessfulAuth('Operator Rajesh Kumar', 'data_operator');
      }, 350);
      return;
    }

    // 2. Fallback to API login if custom credentials are used
    try {
      const res = await login({ email, password });
      handleSuccessfulAuth(res.full_name || 'Officer Ananya Sharma', res.role || 'revenue_officer');
    } catch {
      setError(
        'Invalid officer credentials. Please check your email/password or use demo credentials: officer@bhusatya.gov / demo123.'
      );
      setLoading(false);
    }
  };

  const handleSsoContinue = () => {
    setShowSsoModal(false);
    handleSuccessfulAuth('Officer Ananya Sharma (SSO Verified)', 'revenue_officer');
  };

  return (
    <div className="login-page">
      {/* ─── Scenic Land Parcel Background ─── */}
      <div className="login-page__bg" aria-hidden="true">
        <img
          src={heroNight}
          alt="Atmospheric aerial view of Indian land parcels at twilight"
          className="login-page__bg-img"
        />
        <div className="login-page__vignette" />
      </div>

      {/* ─── Back to Landing Page ─── */}
      <Link to="/" className="login-page__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Return to BhuSatya Home
      </Link>

      {/* ─── Main Content Frame ─── */}
      <div className="login-page__container">
        {/* Left Side: Bold Editorial Typography */}
        <div className="login-page__left">
          <Link to="/" className="login-page__logo">
            <svg
              className="login-page__logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="login-page__logo-text">BhuSatya</span>
          </Link>

          <h1 className="login-page__headline">
            Secure Land Records,
            <span className="login-page__headline-accent">Simplified for Verification</span>
          </h1>

          <p className="login-page__subheadline">
            AI-assisted land record digitization and verification for officers and administrators.
          </p>

          <p className="login-page__supporting-text">
            Upload, detect, and review key land-document elements such as tables, text, signatures, and
            stamps in one unified platform.
          </p>

          <div className="login-page__features">
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>Evidence-based anomaly detection &amp; boundary validation</span>
            </div>
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>Cryptographically verifiable audit log on all officer reviews</span>
            </div>
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>High-speed tabular data extraction &amp; bilingual recognition</span>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Login Panel */}
        <div className="login-page__right">
          <div className="login-card">
            <div className="login-card__header">
              <div className="login-card__badge">
                <span className="login-card__badge-dot" />
                <span>Officer Access Portal</span>
              </div>
              <h2 className="login-card__title">Officer Portal</h2>
              <p className="login-card__subtitle">
                Sign in to access land-record verification tools
              </p>
            </div>

            {error && (
              <div className="login-card__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label className="login-field__label" htmlFor="officer-email">
                  Official Email
                </label>
                <div className="login-field__input-wrap">
                  <input
                    id="officer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@sih.demo"
                    className="login-field__input"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-field__label" htmlFor="officer-password">
                  Password
                </label>
                <div className="login-field__input-wrap">
                  <input
                    id="officer-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-field__input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-field__toggle-pw"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="login-card__forgot-wrap">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="login-card__forgot-link"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-card__btn-primary"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="login-card__divider">or</div>

              <button
                type="button"
                onClick={() => setShowSsoModal(true)}
                className="login-card__btn-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Continue with Government SSO
              </button>

              {/* Demo credentials selector for testing */}
              <div className="login-card__demo-box">
                <div className="login-card__demo-title">Quick Demo Access</div>
                <div className="login-card__demo-pills">
                  <button
                    type="button"
                    className={`login-card__demo-pill ${activeRole === 'officer' ? 'login-card__demo-pill--active' : ''}`}
                    onClick={() => handleDemoFill('officer')}
                  >
                    Revenue Officer
                  </button>
                  <button
                    type="button"
                    className={`login-card__demo-pill ${activeRole === 'operator' ? 'login-card__demo-pill--active' : ''}`}
                    onClick={() => handleDemoFill('operator')}
                  >
                    Data Operator
                  </button>
                </div>
              </div>

              <div className="login-card__footer">
                Need access?
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="login-card__admin-link ml-1 bg-transparent border-none cursor-pointer"
                >
                  Contact administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      <DemoSSOModal
        isOpen={showSsoModal}
        onClose={() => setShowSsoModal(false)}
        onContinue={handleSsoContinue}
      />
    </div>
  );
}
