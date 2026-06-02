import { useState } from 'react';
import { isLoggedIn, logout } from './api';
import Landing from './components/Landing';
import About from './components/About';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AtsAnalyzer from './components/AtsAnalyzer';
import Interview from './components/Interview';
import History from './components/History';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'interview', label: 'Mock Interview', icon: '🎯' },
  { id: 'ats', label: 'ATS Scanner', icon: '📄' },
  { id: 'history', label: 'History', icon: '📁' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

export default function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [activePage, setActivePage] = useState('dashboard');
  const [view, setView] = useState('landing'); // landing | about | auth-login | auth-signup | app

  const handleLogin = () => {
    setAuthenticated(true);
    setView('app');
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setView('landing');
  };

  const handleNavigate = (target) => {
    if (target === 'login') setView('auth-login');
    else if (target === 'signup') setView('auth-signup');
    else if (target === 'about') setView('about');
    else if (target === 'landing') setView('landing');
  };

  // If already logged in, go straight to app
  if (authenticated && view !== 'app') {
    setView('app');
  }

  const renderActiveView = () => {
    // Landing Page
    if (view === 'landing') {
      return <Landing onNavigate={handleNavigate} />;
    }

    // About Page
    if (view === 'about') {
      return <About onBack={() => setView('landing')} />;
    }

    // Auth Pages
    if (view === 'auth-login' || view === 'auth-signup') {
      return (
        <Auth 
          onLogin={handleLogin} 
          initialMode={view === 'auth-signup' ? 'signup' : 'login'}
          onBack={() => setView('landing')} 
        />
      );
    }

    // Main Dashboard Application Layout
    const renderPage = () => {
      switch (activePage) {
        case 'dashboard': return <Dashboard />;
        case 'interview': return <Interview />;
        case 'ats':       return <AtsAnalyzer />;
        case 'history':   return <History />;
        case 'about':     return <About onBack={() => setActivePage('dashboard')} />;
        default:          return <Dashboard />;
      }
    };

    return (
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🧬</div>
            <h2>CareerPrep AI</h2>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item logout" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
            <div style={{ 
              padding: '12px 14px', 
              fontSize: '10px', 
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
              CareerPrep AI v2.0
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content" key={activePage}>
          {/* Background gradient orbs */}
          <div className="orb orb-violet" style={{
            width: '500px', height: '500px', top: '-100px', right: '-150px', opacity: 0.4
          }} />
          <div className="orb orb-cyan" style={{
            width: '400px', height: '400px', bottom: '0', left: '-100px', opacity: 0.3
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {renderPage()}
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="relative z-10 min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {renderActiveView()}
    </div>
  );
}
