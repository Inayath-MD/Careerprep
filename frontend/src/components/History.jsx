import { useState, useEffect } from 'react';
import { getHistory } from '../api';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: '2rem' }}>
        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Loading interview logs...</p>
      </div>
    );
  }

  // Full Screen Detail View
  if (selected) {
    const score = selected.overallScore;
    const scoreColor = score != null
      ? (score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444')
      : 'var(--text-muted)';

    return (
      <div className="animate-in" style={{ padding: '0.5rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-secondary" style={{ fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setSelected(null)}>
              ← Back
            </button>
            <div>
              <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>{selected.interviewType}</h1>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {selected.difficulty} Level — {formatDate(selected.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Left panel */}
          <div className="glass-card-static" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content', border: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Result</h3>

            {score != null ? (
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                border: `4px solid ${scoreColor}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: `0 0 24px ${scoreColor}20`
              }}>
                <span style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--text-bright)' }}>{score.toFixed(1)}</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            ) : (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Session Incomplete
              </div>
            )}

            {selected.overallFeedback ? (
              <p style={{ fontSize: 'var(--font-xs)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{selected.overallFeedback}</p>
            ) : (
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>No feedback for this session.</p>
            )}
          </div>

          {/* Right: Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.5rem' }}>Question-by-Question Review</h2>

            {selected.questions?.map((q, i) => (
              <div key={i} className="glass-card-static" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: 'var(--font-xs)', color: 'var(--text-accent)', fontWeight: 700 }}>Question {i + 1}</h4>
                  {q.score != null && (
                    <span style={{
                      fontSize: 'var(--font-xs)', padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700,
                      border: `1px solid ${q.score >= 7 ? '#10b981' : q.score >= 4 ? '#f59e0b' : '#ef4444'}`,
                      color: q.score >= 7 ? '#10b981' : q.score >= 4 ? '#f59e0b' : '#ef4444',
                    }}>
                      Score: {q.score}/10
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-bright)', lineHeight: 1.6, fontWeight: 600 }}>
                  {q.questionText}
                </p>

                {q.candidateAnswer && (
                  <div>
                    <strong style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Answer:</strong>
                    <p style={{
                      fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
                      background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                      padding: '0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                    }}>{q.candidateAnswer}</p>
                  </div>
                )}

                {q.feedback && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-accent)', fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}>AI Feedback:</strong>
                    {q.feedback}
                  </div>
                )}

                {q.correctAnswer && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <strong style={{ color: '#10b981', fontSize: '10px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model Answer:</strong>
                    <p style={{
                      fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
                      background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                      padding: '0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                    }}>{q.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Session List View
  return (
    <div className="animate-in" style={{ padding: '0.5rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>Interview History</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>Review your past mock interview sessions and scores</p>
      </div>

      {error && <div className="error-message" style={{ fontSize: 'var(--font-xs)', marginBottom: '1.5rem' }}>{error}</div>}

      {sessions.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <div className="empty-state-icon">📁</div>
          <h3 style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 'var(--font-base)' }}>No Interview History</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Complete a mock interview to save records here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.map((session, i) => {
            const score = session.overallScore;
            const scoreColor = score != null
              ? (score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444')
              : 'var(--text-muted)';

            return (
              <div
                key={session.id || i}
                className="glass-card"
                style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid var(--border-default)' }}
                onClick={() => setSelected(session)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--text-bright)', marginBottom: '4px' }}>
                    {session.interviewType || 'Mock Session'}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span>📋 {session.difficulty}</span>
                    <span>📅 {formatDate(session.createdAt)}</span>
                    <span>❓ {session.questions?.length || 0} questions</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontWeight: 800, fontSize: 'var(--font-sm)', color: scoreColor,
                    padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${scoreColor}30`,
                    background: `${scoreColor}08`
                  }}>
                    {score != null ? `${score.toFixed(1)}/10` : 'Pending'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
