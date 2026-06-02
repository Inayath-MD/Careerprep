import { useState, useRef, useEffect } from 'react';
import { getAtsScore } from '../api';

export default function AtsAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const fileRef = useRef(null);

  const circumference = 2 * Math.PI * 72;

  useEffect(() => {
    if (result?.overall_ats_score != null) {
      setAnimatedScore(0);
      const target = result.overall_ats_score;
      const duration = 1200;
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [result]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getAtsScore(file, jobDesc);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = animatedScore >= 70 ? '#10b981' :
                     animatedScore >= 40 ? '#f59e0b' :
                     '#ef4444';

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="animate-in" style={{ padding: '0.5rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>
          ATS Resume Scanner
        </h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Upload your resume and paste a job description to analyze your match score
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Input */}
        <div className="glass-card-static" style={{ padding: '1.5rem', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '1rem' }}>Upload Documents</h2>

          <div
            className="upload-zone"
            style={{
              borderColor: dragOver ? 'var(--accent-primary)' : file ? '#10b981' : undefined,
              background: dragOver ? 'rgba(139, 92, 246, 0.03)' : file ? 'rgba(16, 185, 129, 0.03)' : undefined,
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>{file ? '✅' : '📄'}</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', position: 'relative', zIndex: 1 }}>
              {file ? 'Resume Uploaded' : 'Drag & Drop Resume'}
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px', position: 'relative', zIndex: 1 }}>
              {file ? file.name : 'or click to browse — PDF only'}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Job Description (Optional)</label>
            <textarea
              className="answer-textarea"
              placeholder="Paste the target job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              style={{ minHeight: '120px' }}
            />
          </div>

          {error && <div className="error-message" style={{ fontSize: 'var(--font-xs)', marginTop: '1rem' }}>{error}</div>}

          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{ marginTop: '1.5rem' }}
          >
            {loading ? 'Scanning Resume...' : 'Scan Resume →'}
          </button>
        </div>

        {/* Right: Results */}
        <div className="glass-card-static" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '420px', border: '1px solid var(--border-default)' }}>
          
          {loading && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0', width: '100%' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }}></div>
              <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-bright)' }}>Analyzing Resume...</h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Matching skills against job criteria</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in" style={{ width: '100%' }}>
              <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '1.5rem' }}>Scan Results</h2>
              
              {/* Score Ring */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <div className="score-ring">
                  <svg width="160" height="160" viewBox="0 0 180 180">
                    <circle className="score-ring-bg" cx="90" cy="90" r="72" strokeWidth="8" fill="none" />
                    <circle
                      className="score-ring-fill"
                      cx="90" cy="90" r="72"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="score-ring-value">
                    <div className="score-number" style={{ color: scoreColor }}>{animatedScore}%</div>
                    <div className="score-label">Match Score</div>
                  </div>
                </div>
              </div>

              {result.job_match_score > 0 && (
                <div style={{ textAlign: 'center', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Job Alignment: <strong style={{ 
                    color: 'var(--text-bright)', 
                    background: 'rgba(139, 92, 246, 0.08)', 
                    border: '1px solid rgba(139, 92, 246, 0.15)', 
                    padding: '2px 8px', borderRadius: 'var(--radius-sm)' 
                  }}>{result.job_match_score}%</strong>
                </div>
              )}

              {/* Detected Skills */}
              {result.detected_skills?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Skills Detected:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {result.detected_skills.map((skill, i) => (
                      <span key={i} style={{
                        fontSize: 'var(--font-xs)', padding: '3px 10px',
                        background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)',
                        color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', fontWeight: 500
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missing_skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Missing Skills:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {result.missing_skills.map((skill, i) => (
                      <span key={i} style={{
                        fontSize: 'var(--font-xs)', padding: '3px 10px',
                        background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
                        color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontWeight: 500
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

               {/* Feedback */}
               {result.feedback && (
                 <div style={{
                   padding: '1rem', background: 'var(--bg-primary)',
                   border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                   fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6
                 }}>
                   <span style={{ color: 'var(--text-accent)', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>AI Feedback:</span>
                   <p>{result.feedback}</p>
                 </div>
               )}
            </div>
          )}

          {!result && !loading && (
            <div className="empty-state" style={{ border: 'none', background: 'transparent', padding: '2.5rem' }}>
              <div className="empty-state-icon">📄</div>
              <h3 style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 'var(--font-sm)' }}>No Scan Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginTop: '0.375rem' }}>Upload your resume to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
