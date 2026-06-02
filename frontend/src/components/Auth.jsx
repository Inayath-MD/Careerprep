import { useState } from 'react';
import { signup, login } from '../api';

export default function Auth({ onLogin, initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const msg = await signup(name, email, password);
        setSuccess(msg || 'Account created! Please login.');
        setMode('login');
        setName('');
        setPassword('');
      } else {
        await login(email, password);
        onLogin();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background orbs */}
      <div className="orb orb-violet" style={{ width: '500px', height: '500px', top: '-150px', right: '-100px' }} />
      <div className="orb orb-cyan" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-50px' }} />
      <div className="orb orb-pink" style={{ width: '300px', height: '300px', top: '50%', left: '20%' }} />

      <div className="auth-card glass-card-static" style={{ border: '1px solid var(--border-default)' }}>
        {onBack && (
          <button className="btn-back mb-6 flex items-center gap-1" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
            <span>←</span> Back
          </button>
        )}

        <div className="auth-brand">
          <div className="auth-brand-icon">🧬</div>
          <h1>CareerPrep AI</h1>
          <p>{mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
            Register
          </button>
        </div>

        {error && <div className="error-message" style={{ fontSize: 'var(--font-xs)', marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-message" style={{ fontSize: 'var(--font-xs)', marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div className="form-group animate-in" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" 
                type="text" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" 
              type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input className="form-input" 
              type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Authenticating...
              </span>
            ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
