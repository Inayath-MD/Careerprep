import { useState, useEffect } from 'react';

export default function Landing({ onNavigate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div className={`landing-wrapper ${visible ? 'visible' : ''}`}>
      {/* Floating gradient orbs */}
      <div className="orb orb-violet" style={{ width: '600px', height: '600px', top: '-200px', right: '-200px' }} />
      <div className="orb orb-cyan" style={{ width: '500px', height: '500px', bottom: '-150px', left: '-150px' }} />
      <div className="orb orb-pink" style={{ width: '350px', height: '350px', top: '40%', left: '50%' }} />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="sidebar-brand-icon">🧬</div>
          <span className="landing-nav-title">CareerPrep AI</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn-ghost text-sm font-semibold" onClick={() => onNavigate('about')} style={{ fontSize: 'var(--font-sm)' }}>About</button>
          <button className="btn-ghost text-sm font-semibold" onClick={() => onNavigate('login')} style={{ fontSize: 'var(--font-sm)' }}>Sign In</button>
          <button className="btn-cta-sm" onClick={() => onNavigate('signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="hero-badge">
            ✨ AI-Powered Interview Preparation
          </div>
          
          <h1 className="hero-title">
            Ace Your Next Interview with{' '}
            <span className="hero-gradient-text">CareerPrep AI</span>
          </h1>
          
          <p className="hero-subtitle">
            Practice real-world technical interviews, get instant AI-powered grading, 
            scan resumes for ATS compatibility, and build custom learning roadmaps.
          </p>
          
          <div className="hero-actions">
            <button className="btn-cta" onClick={() => onNavigate('signup')}>
              Start Free Prep Session →
            </button>
            <button className="btn-outline" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See Features
            </button>
          </div>

          {/* Stats bar */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value gradient-text">9+</span>
              <span className="hero-stat-label">AI Integrations</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value gradient-text">&lt;5ms</span>
              <span className="hero-stat-label">RAG Retrieval</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value gradient-text">LLM</span>
              <span className="hero-stat-label">Evaluation Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <h2 className="features-title">Platform Features</h2>
        <p className="features-subtitle">Everything you need to land your next technical role</p>

        <div className="features-grid">
          {[
            { icon: '🎯', title: 'AI Mock Interviews', desc: 'Practice technical interviews tailored to your resume. Our RAG engine generates personalized questions from your experience.' },
            { icon: '📄', title: 'ATS Resume Scanner', desc: 'Analyze your resume against job descriptions. Get compatibility scores, keyword matches, and skill gap analyses.' },
            { icon: '🧠', title: 'AI Performance Grading', desc: 'Receive detailed score breakdowns with correct answers, improvement areas, and conceptual gap analysis.' },
            { icon: '🗺️', title: 'AI Learning Roadmaps', desc: 'Auto-generate milestone-based study plans focused on your weaknesses with recommended resources.' },
            { icon: '🔒', title: 'Proctored Mock Mode', desc: 'Simulate real exam environments. Track tab switches and focus drifts to build test discipline.' },
            { icon: '📊', title: 'Performance Dashboard', desc: 'Track progress over time with analytics, score trends, and personalized improvement recommendations.' },
          ].map((f, i) => (
            <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--font-base)', color: 'var(--text-bright)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-card glass-card-glow">
          <h2 style={{ color: 'var(--text-bright)' }}>Ready to Level Up?</h2>
          <p>Create a free account and start practicing with AI-powered mock interviews today.</p>
          <button className="btn-cta" onClick={() => onNavigate('signup')} style={{ position: 'relative' }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CareerPrep AI. Built with Spring Boot, FastAPI & React.</p>
      </footer>
    </div>
  );
}
