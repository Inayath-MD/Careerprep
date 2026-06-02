const BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Signup failed');
  }
  return await res.text();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Login failed');
  }
  const token = await res.text();
  localStorage.setItem('token', token);
  return token;
}

export async function generateInterview(file, interviewType, difficulty, numQuestions) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('interviewType', interviewType);
  formData.append('difficulty', difficulty);
  formData.append('numQuestions', numQuestions);

  const res = await fetch(`${BASE_URL}/resume/generate-interview`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Interview generation failed');
  }
  return await res.json();
}

export async function getAtsScore(file, jobDescription) {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) {
    formData.append('jobDescription', jobDescription);
  }

  const res = await fetch(`${BASE_URL}/resume/ats-score`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'ATS scoring failed');
  }
  return await res.json();
}

export async function submitAnswers(sessionId, answers) {
  const res = await fetch(`${BASE_URL}/resume/submit-answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ sessionId, answers }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Answer submission failed');
  }
  return await res.json();
}

export async function getHistory() {
  const res = await fetch(`${BASE_URL}/resume/history`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return await res.json();
}

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/resume/dashboard`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return await res.json();
}

export function logout() {
  localStorage.removeItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}
