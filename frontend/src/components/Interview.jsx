import { useState, useRef, useEffect, useCallback } from 'react';
import { generateInterview, submitAnswers } from '../api';

export default function Interview() {
  const [phase, setPhase] = useState('setup'); // setup | hw-check | active | evaluating | results
  const [file, setFile] = useState(null);
  const [interviewType, setInterviewType] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const [results, setResults] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);

  // Tab switch detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const interviewRef = useRef(null);

  // Voice Speech-to-Text
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Hardware Stream
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const activeVideoRef = useRef(null);
  const [micLevel, setMicLevel] = useState(20);

  // Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const timerIntervalRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const qId = session?.questions[currentQ]?.id;
        if (qId) {
          setAnswers((prev) => ({
            ...prev,
            [qId]: (prev[qId] || '') + ' ' + transcript
          }));
        }
      };

      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, [session, currentQ]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Mic Level Pulsing
  useEffect(() => {
    if (phase !== 'hw-check') return;
    const interval = setInterval(() => {
      setMicLevel(Math.floor(Math.random() * 60) + 15);
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  // Hardware check
  const startHardwareCheck = () => {
    setPhase('hw-check');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch((err) => console.warn('Hardware unavailable:', err));
  };

  const stopHardwareStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const launchActiveInterview = () => {
    setPhase('active');
    enterFullscreen();
    setTimeLeft(180);
    setTimeout(() => {
      if (stream && activeVideoRef.current) activeVideoRef.current.srcObject = stream;
    }, 200);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'active') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleNextOrSubmit(); return 180; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [phase, currentQ]);

  // Tab switch detection
  useEffect(() => {
    if (phase !== 'active') return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      setTabWarning(true);
      setTimeout(() => setTabWarning(false), 4000);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  // Fullscreen
  const enterFullscreen = useCallback(() => {
    const el = interviewRef.current || document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleStartSetup = async () => {
    if (!file || !interviewType) return;
    setSetupLoading(true);
    setError('');
    try {
      const data = await generateInterview(file, interviewType, difficulty, numQuestions);
      setSession(data);
      setAnswers({});
      setCurrentQ(0);
      setTabSwitchCount(0);
      startHardwareCheck();
    } catch (err) {
      setError(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const questions = session?.questions || [];
  const progressFill = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const isLast = currentQ === questions.length - 1;

  const handleNextOrSubmit = () => {
    if (isListening) toggleListening();
    if (!isLast) {
      setCurrentQ(currentQ + 1);
      setTimeLeft(180);
    } else {
      handleSubmitAll();
    }
  };

  const handlePrev = () => {
    if (isListening) toggleListening();
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setTimeLeft(180);
    }
  };

  const handleSubmitAll = async () => {
    if (isListening) toggleListening();
    stopHardwareStream();
    if (isFullscreen) exitFullscreen();
    setPhase('evaluating');
    try {
      const answersList = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));
      const data = await submitAnswers(session.id, answersList);
      setResults(data);
      setPhase('results');
    } catch (err) {
      setError(err.message);
      setPhase('active');
    }
  };

  const wordCount = (text) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);
  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /* ========== SETUP ========== */
  if (phase === 'setup') {
    return (
      <div className="animate-in" style={{ padding: '0.5rem 0' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>
            Mock Interview Setup
          </h1>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Upload your resume and select a target role to generate practice questions.
          </p>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="glass-card-static" style={{ padding: '2rem', border: '1px solid var(--border-default)' }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '1.5rem' }}>Interview Configuration</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Target Resume (PDF)</label>
              <div
                className="upload-zone"
                style={{
                  borderColor: file ? '#10b981' : undefined,
                  background: file ? 'rgba(16, 185, 129, 0.03)' : undefined,
                  padding: '1.5rem',
                }}
                onClick={() => fileRef.current?.click()}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>{file ? '✅' : '📄'}</div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', position: 'relative', zIndex: 1 }}>
                  {file ? file.name : 'Select Resume File'}
                </div>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Target Role / Interview Type</label>
              <input className="form-input"
                type="text" placeholder="e.g. Java Backend Developer"
                value={interviewType} onChange={(e) => setInterviewType(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Difficulty Level</label>
                <select className="form-input select-input" value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="form-label">Number of Questions</label>
                <select className="form-input select-input" value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}>
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>{n} Questions</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="error-message" style={{ fontSize: 'var(--font-xs)', marginBottom: '1rem' }}>{error}</div>}

            <button className="btn-primary" onClick={handleStartSetup}
              disabled={!file || !interviewType || setupLoading}>
              {setupLoading ? 'Generating questions...' : 'Start Interview →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '1rem' }}>
              ⚠️ Tab switches during the interview will be logged for proctoring.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ========== HARDWARE CHECK ========== */
  if (phase === 'hw-check') {
    return (
      <div className="animate-in" style={{ padding: '0.5rem 0' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>Hardware Check</h1>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>Ensure your camera and microphone work properly.</p>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="glass-card-static" style={{ padding: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-default)' }}>
            <div className="hud-cam-check" style={{ marginBottom: '1.5rem' }}>
              <video ref={videoRef} autoPlay playsInline muted className="hud-cam-video" />
              <div className="hud-cam-scanning-text">📹 Camera Live</div>
            </div>

            <div style={{ width: '100%', maxWidth: '380px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Microphone Level:</span>
              <div style={{ height: '8px', background: 'rgba(139, 92, 246, 0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${micLevel}%`,
                  background: 'var(--accent-gradient)',
                  transition: 'width 0.15s ease', borderRadius: 'var(--radius-full)',
                  boxShadow: '0 0 12px rgba(139, 92, 246, 0.2)'
                }} />
              </div>
            </div>

            <button className="btn-cta" style={{ width: '100%' }} onClick={launchActiveInterview}>
              Enter Mock Interview →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========== ACTIVE SESSION ========== */
  if (phase === 'active') {
    const q = questions[currentQ];

    return (
      <div className="proctored-overlay" ref={interviewRef}>
        {tabWarning && (
          <div className="tab-warning-banner" style={{ background: 'rgba(239, 68, 68, 0.9)', border: '1px solid rgba(239, 68, 68, 0.6)', color: 'white', fontWeight: 600 }}>
            <span>⚠️ Focus lost! Tab switch logged.</span>
          </div>
        )}

        {/* Header */}
        <div className="proctored-header">
          <div className="proctored-brand">
            <div className="sidebar-brand-icon">🧬</div>
            <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: 'var(--font-sm)' }}>CareerPrep AI</span>
            <span className="proctored-badge">Proctored</span>
          </div>

          <div className="proctored-info">
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{session?.interviewType} ({session?.difficulty})</span>
            <div className="tab-switch-counter" style={{
              border: `1px solid ${tabSwitchCount > 0 ? 'var(--color-danger-border)' : 'var(--border-subtle)'}`,
              color: tabSwitchCount > 0 ? 'var(--color-danger)' : 'var(--text-secondary)',
              fontWeight: 600
            }}>
              Tab Switches: <strong>{tabSwitchCount}</strong>
            </div>
            {!isFullscreen && (
              <button className="btn-secondary" style={{ fontSize: 'var(--font-xs)' }} onClick={enterFullscreen}>Fullscreen</button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="proctored-progress">
          <div className="progress-bar-header">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(progressFill)}% Complete</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressFill}%` }}></div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '2rem' }}>
          <div className="question-card glass-card-static" style={{ border: '1px solid var(--border-default)', position: 'relative' }}>
            <span className="question-number">Technical Question</span>
            <div className="question-text">{q?.questionText}</div>

            <div style={{ position: 'relative', marginTop: '1.5rem' }}>
              <textarea
                className="answer-textarea"
                placeholder="Type your answer here..."
                value={answers[q?.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                style={{ height: '200px' }}
              />

              {recognitionRef.current && (
                <button
                  onClick={toggleListening}
                  style={{
                    position: 'absolute', right: '12px', bottom: '12px',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isListening ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
                    background: isListening ? 'var(--color-danger-bg)' : 'rgba(0, 0, 0, 0.04)',
                    color: isListening ? 'var(--color-danger)' : 'var(--text-secondary)',
                    fontSize: 'var(--font-xs)', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Speech-to-Text"
                >
                  🎙️ {isListening ? 'Listening...' : 'Voice'}
                </button>
              )}
            </div>

            <div className="answer-footer">
              <span className="word-counter">Words: {wordCount(answers[q?.id])}</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {currentQ > 0 && (
                  <button className="btn-secondary" onClick={handlePrev}>Previous</button>
                )}
                <button
                  className={isLast ? 'btn-cta' : 'btn-secondary'}
                  style={isLast ? { fontWeight: 700 } : { fontWeight: 600 }}
                  onClick={handleNextOrSubmit}
                >
                  {isLast ? 'Submit Interview →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {/* Timer */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: `2px solid ${timeLeft < 30 ? 'var(--color-danger)' : 'var(--border-default)'}`,
              background: 'var(--bg-secondary)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: timeLeft < 30 ? '0 0 16px rgba(239, 68, 68, 0.15)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-xs)', color: timeLeft < 30 ? 'var(--color-danger)' : 'var(--text-accent)' }}>{formatTimer(timeLeft)}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Timer</span>
            </div>

            {/* Webcam PIP */}
            <div style={{
              width: '80px', height: '80px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)', overflow: 'hidden',
              background: 'var(--bg-tertiary)', position: 'relative',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)'
            }}>
              <video ref={activeVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
              }} />
            </div>

            {/* Question selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {questions.map((q, i) => (
                <button key={i}
                  style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${i === currentQ ? 'var(--accent-primary)' : answers[q.id] ? '#10b981' : 'var(--border-subtle)'}`,
                    background: i === currentQ ? 'rgba(139, 92, 246, 0.1)' : answers[q.id] ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    color: i === currentQ ? 'var(--text-bright)' : answers[q.id] ? '#10b981' : 'var(--text-muted)',
                    fontSize: 'var(--font-xs)', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setCurrentQ(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========== EVALUATING ========== */
  if (phase === 'evaluating') {
    return (
      <div className="eval-loader">
        <div className="eval-brain-container">
          <div className="eval-brain-ring"></div>
          <div className="eval-loader-icon">🧠</div>
        </div>
        <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-bright)' }}>Evaluating Responses...</h2>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>AI is analyzing your answers against model benchmarks</p>
        <div className="loading-dots" style={{ marginTop: '1rem' }}>
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  /* ========== RESULTS ========== */
  if (phase === 'results' && results) {
    const score = results.overallScore || 0;
    const scoreColor = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';

    return (
      <div className="animate-in" style={{ padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>Interview Results</h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>{results.interviewType} — Completed</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: 'var(--font-xs)' }}
            onClick={() => { setPhase('setup'); setSession(null); setResults(null); setAnswers({}); setTabSwitchCount(0); }}>
            New Interview →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          {/* Left panel */}
          <div className="glass-card-static" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--border-default)', height: 'fit-content' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              border: `4px solid ${scoreColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', marginTop: '0.5rem',
              boxShadow: `0 0 24px ${scoreColor}20`
            }}>
              <span style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--text-bright)' }}>{score.toFixed(1)}</span>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>/ 10</span>
            </div>

            {results.overallFeedback && (
              <p style={{ fontSize: 'var(--font-xs)', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{results.overallFeedback}</p>
            )}

            {tabSwitchCount > 0 && (
              <div style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-danger-border)',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-xs)', fontWeight: 600
              }}>
                ⚠️ Tab Switches: {tabSwitchCount}
              </div>
            )}
          </div>

          {/* Right: Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.5rem' }}>Question-by-Question Review</h2>

            {results.questions?.map((q, i) => (
              <div key={i} className="glass-card-static" style={{ border: '1px solid var(--border-default)' }}>
                <button style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', textAlign: 'left', fontSize: 'var(--font-sm)',
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  cursor: 'pointer', fontFamily: 'var(--font-family)'
                }} onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                  <span style={{ fontWeight: 700, flex: 1, marginRight: '1rem' }}>
                    Q{i + 1}: {q.questionText}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${q.score >= 7 ? '#10b981' : q.score >= 4 ? '#f59e0b' : '#ef4444'}`,
                      color: q.score >= 7 ? '#10b981' : q.score >= 4 ? '#f59e0b' : '#ef4444',
                      fontSize: 'var(--font-xs)', fontWeight: 700
                    }}>
                      {q.score}/10
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedQ === i ? 'rotate(90deg)' : 'none' }}>▸</span>
                  </div>
                </button>

                {expandedQ === i && (
                  <div className="animate-in" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
                    {q.candidateAnswer && (
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Your Answer:</strong>
                        <p style={{
                          fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
                          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                          padding: '0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                        }}>{q.candidateAnswer}</p>
                      </div>
                    )}
                    {q.feedback && (
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--text-accent)', display: 'block', marginBottom: '4px' }}>AI Feedback:</strong>
                        {q.feedback}
                      </div>
                    )}
                    {q.correctAnswer && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        <strong style={{ color: '#10b981', fontSize: 'var(--font-xs)', display: 'block', marginBottom: '4px' }}>Model Answer:</strong>
                        <p style={{
                          fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
                          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                          padding: '0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                        }}>{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
