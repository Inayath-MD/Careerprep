import { useState, useEffect } from 'react';
import { getDashboard } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPhase, setOpenPhase] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="error-message">⚠️ Error loading dashboard: {error}</div>
      </div>
    );
  }

  const stats = [
    { icon: '📝', label: 'Interviews Taken', value: data?.totalInterviews || 0, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    { icon: '📊', label: 'Average Score', value: data?.averageScore != null ? `${data.averageScore.toFixed(1)}/10` : '0.0/10', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
    { icon: '🏆', label: 'Highest Score', value: data?.highestScore != null ? `${data.highestScore.toFixed(1)}/10` : '0.0/10', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    { icon: '⚡', label: 'Areas to Improve', value: data?.weakTopicsCount || 0, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  ];

  const roadmap = data?.aiRoadmap?.roadmap || [];

  return (
    <div className="animate-in" style={{ padding: '0.5rem 0' }}>
      {/* Header */}
      <div className="dashboard-greeting" style={{ marginBottom: '2rem' }}>
        <h1>{getGreeting()} 👋</h1>
        <p>Here's an overview of your interview preparation progress.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card-static stat-card-premium"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.color, borderRadius: '3px 3px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              </div>
              <div className="stat-icon-box" style={{ background: stat.bg, border: `1px solid ${stat.color}15` }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Roadmap */}
      {roadmap.length > 0 && (
        <div className="glass-card-static" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.25rem' }}>
            🗺️ Recommended Learning Roadmap
          </h2>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            AI-generated study plan from topics where you scored below 7.0
          </p>

          {data?.aiRoadmap?.weak_topics_addressed?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Topics to Improve:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.aiRoadmap.weak_topics_addressed.map((t, i) => (
                  <span key={i} style={{
                    fontSize: 'var(--font-xs)', padding: '3px 10px',
                    background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
                    color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontWeight: 500
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="roadmap-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {roadmap.map((phase, i) => {
              const isOpen = openPhase === i;
              return (
                <div key={i} className="roadmap-phase" style={{ cursor: 'pointer' }} onClick={() => setOpenPhase(isOpen ? null : i)}>
                  <div className="phase-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--text-bright)' }}>{phase.phase}</span>
                      <span className="phase-duration">{phase.duration}</span>
                    </div>

                    {phase.topics_to_study?.length > 0 && (
                      <div className="phase-topics">
                        {phase.topics_to_study.map((topic, j) => (
                          <span key={j} className="topic-tag">{topic}</span>
                        ))}
                      </div>
                    )}

                    {isOpen && (
                      <div className="phase-details animate-in">
                        {phase.learning_steps?.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-accent)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Steps to Study:</span>
                            <ul className="phase-steps" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.25rem' }}>
                              {phase.learning_steps.map((step, j) => (
                                <li key={j} style={{ fontSize: 'var(--font-xs)' }}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {phase.recommended_resources?.length > 0 && (
                          <div>
                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Resources:</span>
                            <div className="phase-resources">
                              {phase.recommended_resources.map((res, j) => (
                                <a key={j} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                                  <span>🔗</span> <span style={{ textDecoration: 'underline' }}>{res.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {roadmap.length === 0 && data?.totalInterviews === 0 && (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <div className="empty-state-icon">🚀</div>
          <h3 style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 'var(--font-base)' }}>No Interview History Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Complete your first mock interview to see performance stats and get a personalized learning roadmap.
          </p>
        </div>
      )}
    </div>
  );
}
