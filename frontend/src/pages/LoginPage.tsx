import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import DemoSSOModal from '../components/auth/DemoSSOModal';
import heroNight from '../assets/bhusatya-hero-night.jpg';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('officer@bhusatya.gov.in');
  const [password, setPassword] = useState('BhuSatya@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'officer' | 'operator'>('officer');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const navigate = useNavigate();

  const handleSuccessfulAuth = (name: string, role: string) => {
    localStorage.setItem('token', 'bhusatya-auth-' + Date.now());
    localStorage.setItem('userId', '101');
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  const handleDemoFill = (role: 'officer' | 'operator') => {
    setActiveRole(role);
    setError('');
    if (role === 'officer') {
      setEmail('officer@bhusatya.gov.in');
      setPassword('BhuSatya@123');
    } else {
      setEmail('operator@bhusatya.gov.in');
      setPassword('BhuSatya@123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    // Check Working Demo Credentials
    const isValidOfficer =
      (trimmedEmail === 'officer@bhusatya.gov.in' ||
        trimmedEmail === 'officer@bhusatya.gov' ||
        trimmedEmail === 'officer@sih.demo') &&
      (password === 'BhuSatya@123' || password === 'demo123');

    const isValidOperator =
      (trimmedEmail === 'operator@bhusatya.gov.in' ||
        trimmedEmail === 'operator@sih.demo') &&
      (password === 'BhuSatya@123' || password === 'demo123');

    setTimeout(() => {
      setLoading(false);
      if (isValidOfficer) {
        handleSuccessfulAuth('Rajesh Kumar', 'Revenue Officer');
      } else if (isValidOperator) {
        handleSuccessfulAuth('Vinod S.', 'Data Entry Operator');
      } else {
        setError('Invalid officer email or password. Please use the authorized demo credentials below.');
      }
    }, 280);
  };

  return (
    <div className="login-page">
      {/* Background Image with Dark Vignette */}
      <div className="login-page__bg">
        <img
          src={heroNight}
          alt="BhuSatya Land Governance Aerial"
          className="login-page__bg-img"
        />
        <div className="login-page__vignette" />
      </div>

      {/* Back to Home Navigation */}
      <Link to="/" className="login-page__back">
        <span>← Back to Platform</span>
      </Link>

      {/* Main Split Layout: Left Content / Right Glass Card */}
      <div className="login-page__container">
        {/* Left Side Content */}
        <div className="login-page__left">
          <Link to="/" className="login-page__logo">
            <span className="text-2xl">🏛️</span>
            <span className="login-page__logo-text">BhuSatya</span>
          </Link>

          <h1 className="login-page__headline">
            Intelligent Land Record
            <span className="login-page__headline-accent">Digitization &amp; Validation</span>
          </h1>

          <p className="login-page__subheadline">
            State Revenue Administration Portal
          </p>

          <p className="login-page__supporting-text">
            A secure, unified platform assisting revenue officers in evidence-preserved
            land-record digitization, element detection, and title adjudication.
          </p>

          <div className="login-page__features">
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>Automated Text, Table, Stamp &amp; Signature Detection</span>
            </div>
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>Supervisory Officer-in-the-Loop Adjudication</span>
            </div>
            <div className="login-page__feature-item">
              <span className="login-page__feature-dot" />
              <span>State RoR &amp; Cadastral Archive Cross-Validation</span>
            </div>
          </div>
        </div>

        {/* Right Side Translucent Glass Card */}
        <div className="login-page__right">
          <div className="login-card">
            <div className="login-card__header">
              <div className="login-card__badge">
                <span className="login-card__badge-dot" />
                <span>Government Portal</span>
              </div>
              <h2 className="login-card__title">Officer Sign In</h2>
              <p className="login-card__subtitle">
                Enter your authorized revenue credentials to access your jurisdictional workspace.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-card__error">
                <span>✕</span>
                <span>{error}</span>
              </div>
            )}

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label className="login-field__label">Official Email</label>
                <div className="login-field__input-wrap">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@bhusatya.gov.in"
                    className="login-field__input"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-field__label">Password</label>
                <div className="login-field__input-wrap">
                  <input
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
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-card__btn-primary"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
              </button>
            </form>

            <div className="login-card__divider">or continue with</div>

            {/* Government SSO Button */}
            <button
              type="button"
              onClick={() => setShowSsoModal(true)}
              className="login-card__btn-secondary"
            >
              <span>🏛️</span>
              <span>Government SSO (MeriPehchaan)</span>
            </button>

            {/* Demo Access Quick Selector */}
            <div className="login-card__demo-box">
              <p className="login-card__demo-title">
                Quick Demo Access (Click to auto-fill)
              </p>
              <div className="login-card__demo-pills">
                <button
                  type="button"
                  onClick={() => handleDemoFill('officer')}
                  className={`login-card__demo-pill ${
                    activeRole === 'officer' ? 'login-card__demo-pill--active' : ''
                  }`}
                >
                  Revenue Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('operator')}
                  className={`login-card__demo-pill ${
                    activeRole === 'operator' ? 'login-card__demo-pill--active' : ''
                  }`}
                >
                  Data Operator
                </button>
              </div>
            </div>

            <div className="login-card__footer">
              Authorized access only ·
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="login-card__admin-link"
              >
                Contact Helpdesk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      <DemoSSOModal
        isOpen={showSsoModal}
        onClose={() => setShowSsoModal(false)}
      />
    </div>
  );
}
