import { useState } from 'react';
import TopNavigation from '../components/landing/TopNavigation';
import ModeSwitcher from '../components/landing/ModeSwitcher';
import type { HeroMode } from '../components/landing/ModeSwitcher';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CapabilitiesSection from '../components/landing/CapabilitiesSection';
import AboutSection from '../components/landing/AboutSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import LandingFooter from '../components/landing/LandingFooter';
import heroDay from '../assets/bhusatya-hero-day.jpg';
import heroNight from '../assets/bhusatya-hero-night.jpg';
import './LandingPage.css';

const heroContent = {
  digitize: {
    line1: 'Land Records,',
    line2: 'Digitized with Intelligence',
    copy: 'Transform scanned land documents into organized digital records using AI-assisted document analysis.',
    bottomText:
      'Digitize legacy land documents while preserving their original evidence and structure.',
  },
  verify: {
    line1: 'Detect. Validate.',
    line2: 'Review with Confidence.',
    copy: 'Identify important document elements and assist officers during land-record verification.',
    bottomText:
      'AI-assisted detection highlights tables, signatures and official stamps for evidence-based review.',
  },
};

export default function LandingPage() {
  const [mode, setMode] = useState<HeroMode>('digitize');
  const [transitioning, setTransitioning] = useState(false);

  const switchMode = (next: HeroMode) => {
    if (next === mode) return;
    setTransitioning(true);
    setTimeout(() => {
      setMode(next);
      setTransitioning(false);
    }, 280);
  };

  const content = heroContent[mode];

  return (
    <div className="landing">
      {/* ─── 1. HERO VIEWPORT ─── */}
      <section className={`hero hero--${mode}`} aria-label="Hero">
        {/* Background Imagery & Atmospheric Layers */}
        <div className="hero__bg" aria-hidden="true">
          {/* Day Image (Digitize) */}
          <img
            src={heroDay}
            alt="Rural Indian agricultural landscape at dawn"
            className={`hero__bg-img hero__bg-img--day ${
              mode === 'digitize' ? 'hero__bg-img--active' : ''
            }`}
            loading="eager"
          />

          {/* Night Image (Verify) */}
          <img
            src={heroNight}
            alt="Rural Indian agricultural landscape at twilight"
            className={`hero__bg-img hero__bg-img--night ${
              mode === 'verify' ? 'hero__bg-img--active' : ''
            }`}
            loading="eager"
          />

          {/* Bottom Atmospheric Mist (blends seamlessly into page) */}
          <div className="hero__mist-bottom" />

          {/* Edge Vignette / Radial Fog */}
          <div className="hero__vignette" />

          {/* Top Gradient for Navigation Contrast */}
          <div className="hero__top-grad" />

          {/* Subtle Cadastral & AI Detection Overlay in Verify Mode */}
          <div
            className={`hero__verification-overlay ${
              mode === 'verify' ? 'hero__verification-overlay--active' : ''
            }`}
          >
            <div className="hero__detect-card hero__detect-card--parcel">
              <span className="hero__detect-dot" />
              <span className="hero__detect-label">PARCEL #104/A</span>
              <span className="hero__detect-badge">SURVEY BOUNDARY</span>
            </div>
            <div className="hero__detect-card hero__detect-card--table">
              <span className="hero__detect-dot" />
              <span className="hero__detect-label">TABLE</span>
              <span className="hero__detect-badge">99.2%</span>
            </div>
            <div className="hero__detect-card hero__detect-card--sig">
              <span className="hero__detect-dot" />
              <span className="hero__detect-label">SIGNATURE</span>
              <span className="hero__detect-badge">98.7%</span>
            </div>
            <div className="hero__detect-card hero__detect-card--stamp">
              <span className="hero__detect-dot" />
              <span className="hero__detect-label">OFFICIAL STAMP</span>
              <span className="hero__detect-badge">99.5%</span>
            </div>
          </div>
        </div>

        {/* Floating Top Navigation */}
        <TopNavigation />

        {/* Centered Headline + Copy (Positioned in open sky) */}
        <div className="hero__content">
          <div
            className={`hero__headline-wrap ${
              transitioning ? 'hero__headline-wrap--fading' : ''
            }`}
          >
            <h1 className="hero__headline">
              <span className="hero__headline-line1">{content.line1}</span>
              <span className="hero__headline-line2">{content.line2}</span>
            </h1>
          </div>

          <p
            className={`hero__copy ${
              transitioning ? 'hero__copy--fading' : ''
            }`}
          >
            {content.copy}
          </p>
        </div>

        {/* Bottom Floating Selector & Supporting Copy */}
        <div className="hero__bottom">
          <ModeSwitcher mode={mode} onModeChange={switchMode} />
          <p
            className={`hero__bottom-text ${
              transitioning ? 'hero__bottom-text--fading' : ''
            }`}
          >
            {content.bottomText}
          </p>
        </div>

        {/* Minimal Scroll Line Indicator */}
        <div className="hero__scroll" aria-hidden="true">
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* ─── 2. WORKFLOW / HOW IT WORKS ─── */}
      <HowItWorksSection />

      {/* ─── 3. CAPABILITIES ─── */}
      <CapabilitiesSection />

      {/* ─── 4. ABOUT BHUSATYA ─── */}
      <AboutSection />

      {/* ─── 5. FINAL CTA / CLOSING ─── */}
      <FinalCTASection />

      {/* ─── 6. FOOTER ─── */}
      <LandingFooter />
    </div>
  );
}
