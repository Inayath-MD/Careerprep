export default function About({ onBack }) {
  const techStack = [
    {
      category: 'Backend API Gateway',
      icon: '⚙️',
      color: 'rgba(139, 92, 246, 0.08)',
      borderColor: 'rgba(139, 92, 246, 0.15)',
      items: [
        { name: 'Spring Boot', desc: 'Authentication, routing, database management, and session state' },
        { name: 'Spring Security + JWT', desc: 'Secure token-based user authentication' },
        { name: 'MySQL + Spring Data JPA', desc: 'Persistent relational database for users and interview history' },
      ],
    },
    {
      category: 'AI Service Pipeline',
      icon: '🧠',
      color: 'rgba(6, 182, 212, 0.08)',
      borderColor: 'rgba(6, 182, 212, 0.15)',
      items: [
        { name: 'FastAPI (Python)', desc: 'Async backend running core AI processing modules' },
        { name: 'Llama-3 (via OpenRouter)', desc: 'Question generation, evaluations, and study plans' },
        { name: 'Sentence Transformers & FAISS', desc: 'Resume embeddings and fast vector search retrieval' },
      ],
    },
    {
      category: 'Frontend Client',
      icon: '🎨',
      color: 'rgba(236, 72, 153, 0.08)',
      borderColor: 'rgba(236, 72, 153, 0.15)',
      items: [
        { name: 'React + Vite', desc: 'Fast, modular interface with hot module replacement' },
        { name: 'Tailwind CSS', desc: 'Utility-first responsive styling system' },
        { name: 'Page Visibility API', desc: 'Tab focus tracking for exam proctoring simulation' },
      ],
    },
  ];

  const features = [
    { icon: '🎯', title: 'Resume-Tailored Questions', desc: 'Resume chunks stored in FAISS vector index. System queries your background to generate personalized technical questions.' },
    { icon: '📄', title: 'ATS Match Analysis', desc: 'Vector embeddings and cosine similarity scoring reveal keyword matches, skill gaps, and compatibility scores.' },
    { icon: '📊', title: 'AI Interview Scoring', desc: 'Answers evaluated for correctness and accuracy using LLM prompts, providing detailed grades out of 10.' },
    { icon: '🗺️', title: 'Personalized Roadmaps', desc: 'Weak topics from past interviews combined to auto-generate milestone schedules with study resources.' },
    { icon: '🔒', title: 'Proctored Simulation', desc: 'Monitors tab switching and focus drifts during tests to build academic integrity and discipline.' },
    { icon: '📈', title: 'Analytics Dashboard', desc: 'Aggregated statistics: total tests, highest scores, improvement trends, and weak topic tracking.' },
  ];

  return (
    <div className="animate-in" style={{ padding: '0.5rem 0' }}>
      {/* Hero */}
      <section style={{ marginBottom: '2.5rem' }}>
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div style={{ marginTop: '1.5rem' }}>
          <div className="hero-badge" style={{ display: 'inline-block' }}>
            🏗️ Platform Architecture
          </div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--text-bright)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            About CareerPrep
          </h1>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.7, marginTop: '0.5rem' }}>
            A multi-tier AI microservice platform integrating a secure Java Spring Boot gateway with a high-performance Python FastAPI AI engine for vector searches, resume screening, and mock interviews.
          </p>
        </div>
      </section>

      {/* Architecture */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-accent)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          ⚡ System Architecture
        </h2>

        <div className="glass-card-static" style={{ padding: '2rem', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.375rem' }}>🖥️</span>
              <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--text-bright)', display: 'block' }}>React Client</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>:5173</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.25rem', color: 'var(--text-muted)' }}>⇄</div>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.375rem' }}>☕</span>
              <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--text-bright)', display: 'block' }}>Spring Boot</strong>
              <span style={{ fontSize: '10px', color: '#10b981', fontFamily: 'var(--font-mono)' }}>:8080</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.25rem', color: 'var(--text-muted)' }}>⇄</div>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.375rem' }}>🐍</span>
              <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--text-bright)', display: 'block' }}>FastAPI AI</strong>
              <span style={{ fontSize: '10px', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>:8000</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
            <div></div>
            <div></div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
              🗄️ MySQL
            </div>
            <div></div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
              🔍 FAISS Index
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-accent)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          🛠️ Tech Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {techStack.map((group, i) => (
            <div key={i} className="glass-card-static" style={{ padding: '1.5rem', borderColor: group.borderColor }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.15rem', padding: '0.5rem', background: group.color, borderRadius: 'var(--radius-sm)', marginRight: '0.75rem' }}>{group.icon}</div>
                <h3 style={{ fontSize: 'var(--font-xs)', color: 'var(--text-bright)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{group.category}</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
                {group.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong style={{ color: 'var(--text-bright)', fontSize: 'var(--font-xs)' }}>{item.name}</strong>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-accent)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          🔥 Platform Features
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: 'var(--font-xs)', color: 'var(--text-bright)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Endpoints */}
      <section>
        <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-accent)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
          🔌 API Endpoints
        </h2>
        <div className="api-table-wrapper">
          <table className="api-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-secondary)' }}>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/auth/signup</td><td>Register a new candidate</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/auth/login</td><td>Login and get JWT token</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/resume/generate-interview</td><td>Upload resume and generate questions</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/resume/ats-score</td><td>Calculate resume ATS compatibility</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/resume/submit-answers</td><td>Submit answers for AI evaluation</td></tr>
              <tr><td><span className="method-badge get">GET</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/resume/history</td><td>Retrieve past interview sessions</td></tr>
              <tr><td><span className="method-badge get">GET</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/resume/dashboard</td><td>Load stats and learning roadmap</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/generate-roadmap</td><td>Generate study path from weak topics</td></tr>
              <tr><td><span className="method-badge post">POST</span></td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>/evaluate-interview</td><td>Evaluate mock answers (FastAPI)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer style={{ marginTop: '3rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
        <p>CareerPrep AI Platform — All Services Online</p>
      </footer>
    </div>
  );
}
