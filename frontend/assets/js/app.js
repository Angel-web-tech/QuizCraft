const API = window.QUIZCRAFT_API || '/api';
const app = document.querySelector('#app');
const toastElement = document.querySelector('#toast');
const state = { user: null, currentQuestion: 0, selectedAnswers: {}, timer: null, role: 'student', quizDraft: [] };

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const number = (value, digits = 0) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits });
const getQuery = () => new URLSearchParams(location.search);
const navLink = (href, label, icon, active) =>
  `<a class="nav-link ${active ? 'active' : ''}" href="${href}" data-nav><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</a>`;
const emptyState = (title, message, action = '') =>
  `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>${action}</div>`;

async function api(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  let response;
  try {
    response = await fetch(`${API}${path}`, { credentials: 'include', ...options, headers });
  } catch {
    throw new Error('Could not reach QuizCraft. Check that the backend is running and MongoDB is connected.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

function notify(message) {
  toastElement.textContent = message;
  toastElement.classList.add('visible');
  window.clearTimeout(notify.timeout);
  notify.timeout = window.setTimeout(() => toastElement.classList.remove('visible'), 3200);
}

function navigate(path, replace = false) {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
  if (replace) history.replaceState({}, '', path);
  else history.pushState({}, '', path);
  window.scrollTo(0, 0);
  render();
}

function pageHeading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${action}</div>`;
}

function shell(content, title) {
  const admin = state.user.role === 'admin';
  const path = location.pathname;
  const nav = admin
    ? [
      ['/admin', 'Dashboard', '◫'],
      ['/admin/quizzes', 'Quiz management', '▤'],
      ['/admin/quizzes/new', 'Create quiz', '+'],
      ['/admin/students', 'Students', '♙'],
      ['/admin/attempts', 'Attempts & results', '✓'],
      ['/admin/reports', 'Reports & analytics', '▥'],
    ]
    : [
      ['/student', 'Overview', '◫'],
      ['/quizzes', 'Discover quizzes', '⌕'],
      ['/history', 'My history', '◷'],
      ['/profile', 'My profile', '♙'],
    ];
  const activeFor = (href) => path === href || (href !== '/admin' && href !== '/student' && path.startsWith(href));
  return `<div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="${admin ? '/admin' : '/student'}" data-nav><span class="brand-mark">Q</span><span>QuizCraft<span class="brand-tagline">Create. Challenge. Conquer.</span></span></a>
      <p class="side-label">${admin ? 'Administration' : 'Workspace'}</p>
      <nav class="nav-list" aria-label="Main navigation">${nav.map(([href, label, icon]) => navLink(href, label, icon, activeFor(href))).join('')}</nav>
      <div class="sidebar-bottom">
        <div class="profile-mini"><span class="avatar">${escapeHtml(initials(state.user.name))}</span><span><strong>${escapeHtml(state.user.name)}</strong><small>${escapeHtml(state.user.role)}</small></span></div>
        <button class="logout-button" type="button" data-action="logout"><span class="nav-icon" aria-hidden="true">↪</span>Log out</button>
      </div>
    </aside>
    <section class="main-area">
      <header class="topbar"><button class="mobile-menu" type="button" aria-label="Open menu" data-action="menu">☰</button><span class="topbar-title">${escapeHtml(title)}</span><span class="topbar-user"><span class="avatar">${escapeHtml(initials(state.user.name))}</span>${escapeHtml(state.user.name)}</span></header>
      <div class="page">${content}</div>
    </section>
  </div>`;
}

function guestPage(content) {
  app.innerHTML = content;
  bindForms();
}

function authPage(role = 'student', registration = false) {
  state.role = role;
  const studentRegistration = `<p class="auth-links">New to QuizCraft? <a href="/register" data-nav>Create your student account</a></p>`;
  const form = registration
    ? `<form class="auth-form" id="register-form" novalidate>
        <div class="field"><label for="full-name">Full name</label><input class="input" id="full-name" name="name" autocomplete="name" required maxlength="120"></div>
        <div class="field"><label for="register-number">Student register number</label><input class="input" id="register-number" name="registerNumber" required maxlength="40"></div>
        <div class="field"><label for="department">Department</label><input class="input" id="department" name="department" required maxlength="120"></div>
        <div class="field"><label for="register-email">Email address</label><input class="input" id="register-email" name="email" type="email" autocomplete="email" required maxlength="254"></div>
        <div class="field"><label for="register-password">Password</label><div class="password-field"><input class="input" id="register-password" name="password" type="password" autocomplete="new-password" minlength="10" required><button class="password-toggle" type="button" data-action="toggle-password" data-target="register-password">Show</button></div><small class="form-note">Use at least 10 characters.</small></div>
        <div class="field"><label for="confirm-password">Confirm password</label><input class="input" id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required></div>
        <p class="form-error" id="form-error" aria-live="polite"></p>
        <button class="button block" type="submit">Create student account</button>
      </form>${studentRegistration.replace('New to QuizCraft?', 'Already have an account?').replace('Create your student account', 'Sign in').replace('/register', '/login')}`
    : `<div class="role-switch" role="group" aria-label="Select sign-in type">
         <button type="button" class="${role === 'student' ? 'active' : ''}" data-action="role" data-role="student" aria-pressed="${role === 'student'}">Student login</button>
         <button type="button" class="${role === 'admin' ? 'active' : ''}" data-action="role" data-role="admin" aria-pressed="${role === 'admin'}">Admin login</button>
       </div>
       <form class="auth-form" id="login-form" novalidate>
         <div class="field"><label for="login-email">Email address</label><input class="input" id="login-email" name="email" type="email" autocomplete="username" required maxlength="254" placeholder="you@example.com"></div>
         <div class="field"><label for="login-password">Password</label><div class="password-field"><input class="input" id="login-password" name="password" type="password" autocomplete="current-password" required><button class="password-toggle" type="button" data-action="toggle-password" data-target="login-password">Show</button></div></div>
         <p class="form-error" id="form-error" aria-live="polite"></p>
         <button class="button block" type="submit">Sign in as ${role === 'admin' ? 'Admin' : 'Student'}</button>
       </form>${studentRegistration}`;

  guestPage(`<div class="auth-page">
    <section class="auth-side"><a class="brand" href="/" data-nav><span class="brand-mark">Q</span><span>QuizCraft<span class="brand-tagline">Create. Challenge. Conquer.</span></span></a><div class="auth-side-copy"><p class="eyebrow">Learning, reimagined</p><h2>Make every question count.</h2><p>Create engaging assessments, challenge your knowledge, and see your progress clearly.</p></div><p class="auth-side-foot">A focused space for better learning.</p></section>
    <section class="auth-main"><div class="auth-card"><div class="auth-heading"><p class="eyebrow">${registration ? 'Student registration' : role === 'admin' ? 'Administrator access' : 'Welcome to QuizCraft'}</p><h1>${registration ? 'Create your account' : 'Welcome back'}</h1><p>${registration ? 'Join QuizCraft and start learning with interactive quizzes.' : role === 'admin' ? 'Sign in to manage quizzes, students, and reports.' : 'Sign in to discover quizzes and track your progress.'}</p></div>${form}</div></section>
  </div>`);
}

async function studentDashboard() {
  const [dashboard, listing] = await Promise.all([
    api('/student/dashboard'),
    api('/student/quizzes?limit=3'),
  ]);
  const recent = dashboard.recentAttempts.length
    ? `<div class="table-wrap"><table><thead><tr><th>Quiz</th><th>Score</th><th>Status</th><th>Date</th></tr></thead><tbody>${dashboard.recentAttempts.map((attempt) => `<tr><td><strong>${escapeHtml(attempt.quiz?.title || 'Quiz')}</strong><span class="table-sub">${escapeHtml(attempt.quiz?.category || '')}</span></td><td>${number(attempt.score)}/${number(attempt.totalMarks)} <span class="table-sub">${number(attempt.percentage, 1)}%</span></td><td><span class="tag ${attempt.status === 'submitted' ? 'success' : 'warning'}">${escapeHtml(attempt.status.replace('_', ' '))}</span></td><td>${formatDate(attempt.createdAt)}</td></tr>`).join('')}</tbody></table></div>`
    : emptyState('Your activity starts here', 'Take a published quiz and your latest results will appear here.', '<a class="button small" href="/quizzes" data-nav>Explore quizzes</a>');
  return `${pageHeading('Student workspace', `Welcome back, ${dashboard.user.name}`, 'Pick up where you left off or find a new challenge.')}
    <div class="grid stats-grid">
      ${statCard('Available quizzes', dashboard.availableQuizzes, 'Ready to explore', '◫')}
      ${statCard('Quizzes completed', dashboard.completedQuizzes, 'Submitted attempts', '✓')}
      ${statCard('Average score', `${number(dashboard.averageScore, 1)}%`, 'Across completed quizzes', '↗')}
      ${statCard('Department', dashboard.user.department || '—', dashboard.user.registerNumber || 'Student account', '♙')}
    </div>
    <div class="section-title"><div><h2>Recently attempted</h2><p>Your latest quiz activity</p></div><a class="button secondary small" href="/history" data-nav>View history</a></div>${recent}
    <div class="section-title"><div><h2>Available quizzes</h2><p>Published challenges picked for you</p></div><a class="button secondary small" href="/quizzes" data-nav>Browse all</a></div>
    ${listing.quizzes.length ? `<div class="grid quiz-grid">${listing.quizzes.map(quizCard).join('')}</div>` : emptyState('No quizzes published yet', 'Check again later for new challenges.')}`;
}

function statCard(label, value, note, icon) {
  return `<article class="stat-card"><span class="stat-icon" aria-hidden="true">${icon}</span><span class="stat-label">${escapeHtml(label)}</span><strong class="stat-value">${escapeHtml(value)}</strong><span class="stat-foot">${escapeHtml(note)}</span></article>`;
}

function quizCard(quiz) {
  return `<article class="quiz-card"><span class="tag">${escapeHtml(quiz.category)}</span><h3>${escapeHtml(quiz.title)}</h3><p>${escapeHtml(quiz.description || 'A new QuizCraft challenge is ready.')}</p><div class="quiz-meta"><span>${number(quiz.durationMinutes)} min</span><span>${number(quiz.totalMarks)} marks</span><span>${escapeHtml(quiz.difficulty)}</span></div><a class="button block" href="/quiz/${encodeURIComponent(quiz._id)}" data-nav>View quiz</a></article>`;
}

async function quizList() {
  const params = getQuery();
  const query = new URLSearchParams();
  for (const key of ['search', 'category', 'difficulty', 'page']) if (params.get(key)) query.set(key, params.get(key));
  query.set('limit', '9');
  const data = await api(`/student/quizzes?${query}`);
  const quizzes = data.quizzes.length ? `<div class="grid quiz-grid">${data.quizzes.map(quizCard).join('')}</div>` : emptyState('No matching quizzes', 'Try another search or clear the selected filters.');
  return `${pageHeading('Discover', 'Find your next challenge', 'Search published quizzes by title, category, or difficulty.')}
    <form class="toolbar" id="quiz-search">
      <div class="field"><label for="quiz-search-text">Search</label><input class="input" id="quiz-search-text" name="search" value="${escapeHtml(params.get('search') || '')}" placeholder="Quiz title or topic"></div>
      <div class="field"><label for="quiz-category">Category</label><input class="input" id="quiz-category" name="category" value="${escapeHtml(params.get('category') || '')}" placeholder="e.g. Science"></div>
      <div class="field"><label for="quiz-difficulty">Difficulty</label><select class="select" id="quiz-difficulty" name="difficulty"><option value="">All levels</option>${['easy', 'medium', 'hard'].map((level) => `<option ${params.get('difficulty') === level ? 'selected' : ''} value="${level}">${level[0].toUpperCase() + level.slice(1)}</option>`).join('')}</select></div>
      <button class="button" type="submit">Search quizzes</button>
    </form>
    <div class="section-title"><div><h2>${number(data.pagination.total)} ${data.pagination.total === 1 ? 'quiz' : 'quizzes'}</h2><p>Only published quizzes appear here.</p></div></div>${quizzes}
    ${data.pagination.pages > 1 ? `<div class="pagination"><span>Page ${data.pagination.page} of ${data.pagination.pages}</span>${data.pagination.page > 1 ? `<a class="button secondary small" href="${quizPageUrl(params, data.pagination.page - 1)}" data-nav>Previous</a>` : ''}${data.pagination.page < data.pagination.pages ? `<a class="button secondary small" href="${quizPageUrl(params, data.pagination.page + 1)}" data-nav>Next</a>` : ''}</div>` : ''}`;
}

function quizPageUrl(params, page) {
  const next = new URLSearchParams(params);
  next.set('page', page);
  return `/quizzes?${next}`;
}

function paginationControls(pagination) {
  if (!pagination || pagination.pages < 2) return '';
  const params = getQuery();
  const urlFor = (page) => {
    const next = new URLSearchParams(params);
    next.set('page', page);
    return `${location.pathname}?${next}`;
  };
  return `<div class="pagination"><span>Page ${pagination.page} of ${pagination.pages} · ${number(pagination.total)} records</span>${pagination.page > 1 ? `<a class="button secondary small" href="${urlFor(pagination.page - 1)}" data-nav>Previous</a>` : ''}${pagination.page < pagination.pages ? `<a class="button secondary small" href="${urlFor(pagination.page + 1)}" data-nav>Next</a>` : ''}</div>`;
}

async function quizDetail(id) {
  const { quiz } = await api(`/student/quizzes/${encodeURIComponent(id)}`);
  return `${pageHeading('Quiz details', quiz.title, quiz.description || 'Review the instructions before starting.', '<a class="button secondary" href="/quizzes" data-nav>Back to quizzes</a>')}
    <div class="card"><div class="inline-actions"><span class="tag">${escapeHtml(quiz.category)}</span><span class="tag">${escapeHtml(quiz.difficulty)}</span></div>
      <div class="quiz-meta"><span>${number(quiz.durationMinutes)} minutes</span><span>${number(quiz.totalMarks)} total marks</span><span>${quiz.questions.length} questions</span></div>
      <h2>Instructions</h2><p class="muted">${escapeHtml(quiz.instructions || 'Answer each question before the timer ends. You can change answers before submitting.')}</p>
      <p class="form-note">Your time limit begins when you start. Answers are scored by QuizCraft after submission.</p>
      <button class="button" type="button" data-action="start-quiz" data-quiz-id="${escapeHtml(quiz._id)}">Start quiz</button>
    </div>`;
}

function storedAnswers(id) {
  try {
    return JSON.parse(sessionStorage.getItem(`quizcraft-attempt-${id}`) || '{}');
  } catch {
    return {};
  }
}

async function attemptPage(id) {
  const { attempt } = await api(`/attempts/${encodeURIComponent(id)}`);
  if (attempt.status === 'submitted') {
    navigate(`/results/${encodeURIComponent(id)}`, true);
    return '';
  }
  if (attempt.status === 'expired') {
    return `${pageHeading('Attempt expired', 'Time is up', 'This attempt passed its server-enforced deadline and was not scored.')}${emptyState('Attempt expired', 'Your answers were not submitted before the deadline.', '<a class="button" href="/history" data-nav>View history</a>')}`;
  }
  const quiz = attempt.quiz;
  const savedAnswers = { ...Object.fromEntries((attempt.answers || []).map((answer) => [answer.questionId, answer.optionId])), ...storedAnswers(id) };
  state.currentQuestion = 0;
  state.selectedAnswers = savedAnswers;
  state.activeAttempt = attempt;
  state.activeQuiz = quiz;
  return `${pageHeading('Quiz in progress', quiz.title, 'Select an answer for each question. You can change your selections before submitting.')}
    <div class="attempt-head"><div><strong>${escapeHtml(quiz.title)}</strong><div class="quiz-meta"><span>${quiz.questions.length} questions</span><span>${number(quiz.totalMarks)} marks</span></div></div><div class="timer" id="timer" role="timer" aria-live="off">--:--</div></div>
    <div class="progress-track" aria-label="Quiz progress"><div class="progress-fill" id="progress-fill"></div></div>
    <div class="question-nav" id="question-nav" aria-label="Question navigation"></div>
    <div id="question-card"></div>
    <div class="form-actions"><button class="button secondary" id="previous-question" type="button" data-action="previous-question">Previous</button><button class="button secondary" id="next-question" type="button" data-action="next-question">Next</button><button class="button" id="submit-attempt" type="button" data-action="submit-attempt" data-attempt-id="${escapeHtml(id)}">Submit quiz</button></div>`;
}

function updateQuestion() {
  const quiz = state.activeQuiz;
  if (!quiz) return;
  const index = state.currentQuestion;
  const question = quiz.questions[index];
  const selected = state.selectedAnswers[String(question._id)] || '';
  const answeredCount = Object.keys(state.selectedAnswers).length;
  document.querySelector('#question-card').innerHTML = `<section class="card"><p class="eyebrow">Question ${index + 1} of ${quiz.questions.length} · ${number(question.marks)} ${question.marks === 1 ? 'mark' : 'marks'}</p><h2>${escapeHtml(question.text)}</h2><div class="question-options">${question.options.map((option, optionIndex) => `<label class="answer-option"><input type="radio" name="answer" value="${escapeHtml(option._id)}" ${selected === String(option._id) ? 'checked' : ''}><span>${escapeHtml(option.text)}</span></label>`).join('')}</div></section>`;
  document.querySelector('#question-nav').innerHTML = quiz.questions.map((item, i) => `<button type="button" aria-label="Question ${i + 1}${state.selectedAnswers[String(item._id)] ? ', answered' : ', unanswered'}" class="${i === index ? 'current' : ''} ${state.selectedAnswers[String(item._id)] ? 'answered' : ''}" data-action="question" data-index="${i}">${i + 1}</button>`).join('');
  document.querySelector('#progress-fill').style.width = `${Math.round((answeredCount / quiz.questions.length) * 100)}%`;
  document.querySelector('#previous-question').disabled = index === 0;
  document.querySelector('#next-question').disabled = index === quiz.questions.length - 1;
}

function runTimer() {
  const update = () => {
    const remaining = Math.max(0, new Date(state.activeAttempt.deadline).getTime() - Date.now());
    const seconds = Math.floor(remaining / 1000);
    const timer = document.querySelector('#timer');
    if (!timer) return;
    timer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    if (remaining <= 0) {
      window.clearInterval(state.timer);
      state.timer = null;
      notify('The quiz deadline has passed. Checking attempt status…');
      api(`/attempts/${encodeURIComponent(state.activeAttempt.id)}`)
        .then(({ attempt }) => navigate(attempt.status === 'submitted' ? `/results/${attempt.id}` : '/history'))
        .catch((error) => notify(error.message));
    }
  };
  update();
  state.timer = window.setInterval(update, 1000);
}

async function resultsPage(id) {
  const { attempt } = await api(`/attempts/${encodeURIComponent(id)}`);
  if (attempt.status === 'in_progress') {
    navigate(`/attempt/${encodeURIComponent(id)}`, true);
    return '';
  }
  if (attempt.status === 'expired') {
    return `${pageHeading('Quiz results', 'Attempt expired', 'The attempt was not submitted before its deadline.')}${emptyState('No score recorded', 'The server did not score an expired attempt.', '<a class="button" href="/history" data-nav>Return to history</a>')}`;
  }
  const passed = attempt.passed === null ? '' : `<span class="tag ${attempt.passed ? 'success' : 'danger'}">${attempt.passed ? 'Passed' : 'Not passed'}</span>`;
  const elapsedSeconds = attempt.submittedAt && attempt.startedAt
    ? Math.max(0, Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 1000))
    : null;
  const elapsedLabel = elapsedSeconds === null
    ? '—'
    : `${Math.floor(elapsedSeconds / 60)}m ${String(elapsedSeconds % 60).padStart(2, '0')}s`;
  const review = attempt.review?.length ? `<div class="section-title"><div><h2>Answer review</h2><p>Correct answers are shown according to this quiz's review settings.</p></div></div>${attempt.review.map((item, index) => {
    const correct = item.options.find((option) => option.id === item.correctOption);
    const selected = item.options.find((option) => option.id === item.selectedOption);
    return `<article class="review-row"><p>${index + 1}. ${escapeHtml(item.text)}</p><small>Your answer: ${escapeHtml(selected?.text || 'Not answered')}</small><small>Correct answer: ${escapeHtml(correct?.text || '')}</small></article>`;
  }).join('')}` : `<p class="form-note">Answer review is disabled for this quiz.</p>`;
  return `${pageHeading('Quiz results', attempt.quiz?.title || 'Your result', 'Your score was calculated securely by QuizCraft.', '<a class="button secondary" href="/history" data-nav>Attempt history</a>')}
    <div class="card">
      <div class="result-score"><strong>${number(attempt.percentage, 1)}%</strong><span>overall score</span></div>
      <div class="inline-actions" style="justify-content:center">${passed}<span class="tag">${number(attempt.score)}/${number(attempt.totalMarks)} marks</span></div>
      <div class="grid stats-grid" style="margin-top:24px">
        ${statCard('Correct', attempt.correctCount, 'Questions answered correctly', '✓')}
        ${statCard('Incorrect', attempt.incorrectCount, 'Questions answered incorrectly', '×')}
        ${statCard('Unanswered', attempt.unansweredCount, 'Questions left blank', '—')}
        ${statCard('Time taken', elapsedLabel, `Submitted ${formatDate(attempt.submittedAt)}`, '◷')}
      </div>
    </div>${review}<div class="form-actions"><a class="button secondary" href="/history" data-nav>View history</a><a class="button" href="/student" data-nav>Student dashboard</a></div>`;
}

async function historyPage() {
  const params = getQuery();
  const query = new URLSearchParams({ limit: '15' });
  if (params.get('page')) query.set('page', params.get('page'));
  const data = await api(`/student/attempts?${query}`);
  const rows = data.attempts.map((attempt) => `<tr><td><strong>${escapeHtml(attempt.quiz?.title || 'Quiz')}</strong><span class="table-sub">${escapeHtml(attempt.quiz?.category || '')}</span></td><td>${number(attempt.score)}/${number(attempt.totalMarks)}<span class="table-sub">${number(attempt.percentage, 1)}%</span></td><td><span class="tag ${attempt.status === 'submitted' ? 'success' : attempt.status === 'expired' ? 'danger' : 'warning'}">${escapeHtml(attempt.status.replace('_', ' '))}</span></td><td>${formatDate(attempt.createdAt)}</td><td>${attempt.status === 'submitted' ? `<a class="button secondary small" href="/results/${encodeURIComponent(attempt.id)}" data-nav>View result</a>` : '—'}</td></tr>`).join('');
  return `${pageHeading('Your activity', 'Attempt history', 'Review scores and return to previous submitted results.')}
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Quiz</th><th>Score</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${paginationControls(data.pagination)}` : emptyState('No attempts yet', 'Your completed and in-progress quiz attempts will appear here.', '<a class="button" href="/quizzes" data-nav>Discover quizzes</a>')}`;
}

async function profilePage() {
  const { user } = await api('/student/profile');
  return `${pageHeading('Account', 'My profile', 'Your personal student information.')}
    <div class="card" style="max-width:680px"><div class="profile-mini" style="padding:0 0 22px"><span class="avatar">${escapeHtml(initials(user.name))}</span><span><strong>${escapeHtml(user.name)}</strong><small class="muted">Student</small></span></div>
      <div class="field-grid"><div class="field"><span class="label">Full name</span><div>${escapeHtml(user.name)}</div></div><div class="field"><span class="label">Email address</span><div>${escapeHtml(user.email)}</div></div><div class="field"><span class="label">Register number</span><div>${escapeHtml(user.registerNumber || '—')}</div></div><div class="field"><span class="label">Department</span><div>${escapeHtml(user.department || '—')}</div></div></div>
    </div>`;
}

function renderStudentRoute(path) {
  if (path === '/' || path === '/student') return studentDashboard();
  if (path === '/quizzes') return quizList();
  if (path === '/history') return historyPage();
  if (path === '/profile') return profilePage();
  const quizMatch = path.match(/^\/quiz\/([^/]+)$/);
  if (quizMatch) return quizDetail(decodeURIComponent(quizMatch[1]));
  const attemptMatch = path.match(/^\/attempt\/([^/]+)$/);
  if (attemptMatch) return attemptPage(decodeURIComponent(attemptMatch[1]));
  const resultMatch = path.match(/^\/results\/([^/]+)$/);
  if (resultMatch) return resultsPage(decodeURIComponent(resultMatch[1]));
  return Promise.resolve(`${pageHeading('Not found', 'Page not found', 'This page does not exist.')}<a class="button" href="/student" data-nav>Go to dashboard</a>`);
}

async function render() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
  app.innerHTML = '<div class="loading-screen"><span class="spinner" aria-hidden="true"></span><p>Loading QuizCraft…</p></div>';
  try {
    let user = null;
    try {
      ({ user } = await api('/auth/me'));
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    state.user = user;
    const path = location.pathname;
    if (path === '/login' || path === '/admin/login') {
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/student', true);
        return;
      }
      authPage(path === '/admin/login' ? 'admin' : 'student', false);
      return;
    }
    if (path === '/register') {
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/student', true);
        return;
      }
      authPage('student', true);
      return;
    }
    if (!user) {
      navigate(path.startsWith('/admin') ? '/admin/login' : '/login', true);
      return;
    }
    if (user.role === 'admin' && !path.startsWith('/admin')) {
      navigate('/admin', true);
      return;
    }
    if (user.role === 'student' && path.startsWith('/admin')) {
      navigate('/student', true);
      return;
    }

    const content = user.role === 'admin' ? await renderAdminRoute(path) : await renderStudentRoute(path);
    const pageTitle = user.role === 'admin'
      ? 'QuizCraft · Admin'
      : 'QuizCraft · Student workspace';
    app.innerHTML = shell(content || '', pageTitle);
    if (path.startsWith('/attempt/')) {
      updateQuestion();
      runTimer();
    }
    bindForms();
  } catch (error) {
    app.innerHTML = `<div class="centered"><div class="card" style="max-width:500px"><p class="eyebrow">Something went wrong</p><h1>We couldn't load this page</h1><p class="muted">${escapeHtml(error.message)}</p><button class="button" type="button" data-action="retry">Try again</button></div></div>`;
    bindForms();
  }
}

function bindForms() {
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', handleSubmit);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorElement = form.querySelector('#form-error');
  if (errorElement) errorElement.textContent = '';
  const button = form.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Please wait…';
  }
  try {
    const values = Object.fromEntries(new FormData(form).entries());
    if (form.id === 'login-form') {
      const { user } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: values.email, password: values.password, role: state.role }) });
      state.user = user;
      notify('Signed in successfully.');
      navigate(user.role === 'admin' ? '/admin' : '/student', true);
      return;
    }
    if (form.id === 'register-form') {
      if (values.password !== values.confirmPassword) throw new Error('The passwords do not match.');
      await api('/auth/register', { method: 'POST', body: JSON.stringify(values) });
      notify('Account created. You can now sign in.');
      navigate('/login', true);
      return;
    }
    if (form.id === 'quiz-search' || form.id === 'student-search' || form.id === 'admin-quiz-search' || form.id === 'attempt-search') {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
      navigate(`${location.pathname}${params.size ? `?${params}` : ''}`);
      return;
    }
    if (form.id === 'quiz-editor') {
      const questions = [...form.querySelectorAll('.question-editor')].map((question) => ({
        text: question.querySelector('[data-question-text]').value,
        marks: Number(question.querySelector('[data-question-marks]').value),
        correctIndex: Number(question.querySelector('[data-correct-index]').value),
        options: [...question.querySelectorAll('[data-option-text]')].map((input) => input.value),
      }));
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        durationMinutes: Number(values.durationMinutes),
        passingScore: Number(values.passingScore || 0),
        instructions: values.instructions,
        status: values.status,
        allowReview: form.querySelector('[name="allowReview"]').checked,
        questions,
      };
      const quizId = form.dataset.quizId;
      const result = await api(quizId ? `/admin/quizzes/${encodeURIComponent(quizId)}` : '/admin/quizzes', {
        method: quizId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      notify('Quiz saved successfully.');
      navigate(`/admin/quizzes/${encodeURIComponent(result.quiz._id)}/edit`, true);
      return;
    }
  } catch (error) {
    if (errorElement) errorElement.textContent = error.message;
    else notify(error.message);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Submit';
    }
  }
}

document.addEventListener('click', async (event) => {
  const link = event.target.closest('a[data-nav]');
  if (link) {
    event.preventDefault();
    navigate(link.getAttribute('href'));
    return;
  }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action } = control.dataset;
  try {
    if (action === 'retry') return render();
    if (action === 'role') {
      state.role = control.dataset.role;
      document.querySelectorAll('[data-action="role"]').forEach((button) => {
        button.classList.toggle('active', button.dataset.role === state.role);
        button.setAttribute('aria-pressed', String(button.dataset.role === state.role));
      });
      const submit = document.querySelector('#login-form button[type="submit"]');
      if (submit) submit.textContent = `Sign in as ${state.role === 'admin' ? 'Admin' : 'Student'}`;
      return;
    }
    if (action === 'toggle-password') {
      const input = document.getElementById(control.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      control.textContent = input.type === 'password' ? 'Show' : 'Hide';
      return;
    }
    if (action === 'menu') return document.querySelector('#sidebar').classList.toggle('open');
    if (action === 'logout') {
      await api('/auth/logout', { method: 'POST' });
      state.user = null;
      navigate('/login', true);
      notify('You have been signed out.');
      return;
    }
    if (action === 'start-quiz') {
      const { attempt } = await api('/attempts', { method: 'POST', body: JSON.stringify({ quizId: control.dataset.quizId }) });
      state.selectedAnswers = {};
      navigate(`/attempt/${encodeURIComponent(attempt.id)}`);
      return;
    }
    if (action === 'question') {
      state.currentQuestion = Number(control.dataset.index);
      return updateQuestion();
    }
    if (action === 'previous-question' || action === 'next-question') {
      const direction = action === 'previous-question' ? -1 : 1;
      state.currentQuestion = Math.max(0, Math.min(state.activeQuiz.questions.length - 1, state.currentQuestion + direction));
      return updateQuestion();
    }
    if (action === 'submit-attempt') {
      const unanswered = state.activeQuiz.questions.length - Object.keys(state.selectedAnswers).length;
      if (unanswered && !window.confirm(`${unanswered} question(s) are unanswered. Submit anyway?`)) return;
      control.disabled = true;
      const answers = Object.entries(state.selectedAnswers).map(([questionId, optionId]) => ({ questionId, optionId }));
      await api(`/attempts/${encodeURIComponent(control.dataset.attemptId)}/submit`, { method: 'POST', body: JSON.stringify({ answers }) });
      sessionStorage.removeItem(`quizcraft-attempt-${control.dataset.attemptId}`);
      notify('Your quiz has been submitted.');
      navigate(`/results/${encodeURIComponent(control.dataset.attemptId)}`);
      return;
    }
    if (action === 'add-question') {
      state.quizDraft.push({ text: '', marks: 1, correctIndex: 0, options: ['', ''] });
      return renderQuestionEditors();
    }
    if (action === 'remove-question') {
      state.quizDraft.splice(Number(control.dataset.question), 1);
      return renderQuestionEditors();
    }
    if (action === 'add-option') {
      const question = state.quizDraft[Number(control.dataset.question)];
      if (question.options.length >= 8) return notify('A question can have at most 8 options.');
      question.options.push('');
      return renderQuestionEditors();
    }
    if (action === 'remove-option') {
      const question = state.quizDraft[Number(control.dataset.question)];
      if (question.options.length <= 2) return notify('A question must have at least 2 options.');
      question.options.splice(Number(control.dataset.option), 1);
      question.correctIndex = Math.min(question.correctIndex, question.options.length - 1);
      return renderQuestionEditors();
    }
    if (action === 'admin-status') return updateQuizStatus(control.dataset.id, control.dataset.status);
    if (action === 'archive-quiz') return archiveQuiz(control.dataset.id);
    if (action === 'student-status') return updateStudentStatus(control.dataset.id, control.dataset.active === 'true');
  } catch (error) {
    notify(error.message);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('input[name="answer"]')) {
    const question = state.activeQuiz.questions[state.currentQuestion];
    state.selectedAnswers[String(question._id)] = event.target.value;
    sessionStorage.setItem(`quizcraft-attempt-${state.activeAttempt.id}`, JSON.stringify(state.selectedAnswers));
    updateQuestion();
  }
});

window.addEventListener('popstate', render);
render();

async function adminDashboard() {
  const { stats, recentActivity } = await api('/admin/dashboard');
  const rows = recentActivity.map((attempt) => `<tr><td><strong>${escapeHtml(attempt.student?.name || 'Student')}</strong><span class="table-sub">${escapeHtml(attempt.student?.email || '')}</span></td><td>${escapeHtml(attempt.quiz?.title || 'Quiz')}</td><td>${attempt.status === 'submitted' ? `${number(attempt.score)}/${number(attempt.totalMarks)} · ${number(attempt.percentage, 1)}%` : escapeHtml(attempt.status.replace('_', ' '))}</td><td>${formatDate(attempt.createdAt)}</td></tr>`).join('');
  return `${pageHeading('Administration', 'Dashboard', 'A live overview of QuizCraft activity.', '<a class="button" href="/admin/quizzes/new" data-nav>Create a quiz</a>')}
    <div class="grid stats-grid">
      ${statCard('Registered students', stats.students, 'Student accounts', '♙')}
      ${statCard('Total quizzes', stats.totalQuizzes, `${number(stats.publishedQuizzes)} published`, '▤')}
      ${statCard('Draft quizzes', stats.draftQuizzes, 'Not visible to students', '✎')}
      ${statCard('Quiz attempts', stats.attempts, `Average score ${number(stats.averageScore, 1)}%`, '✓')}
    </div>
    <div class="section-title"><div><h2>Recent activity</h2><p>Latest quiz attempts from students</p></div><a class="button secondary small" href="/admin/attempts" data-nav>View all attempts</a></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Quiz</th><th>Result</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState('No activity yet', 'Student quiz attempts will appear here.')}`;
}

async function adminQuizList() {
  const params = getQuery();
  const query = new URLSearchParams();
  for (const key of ['search', 'category', 'status', 'page']) if (params.get(key)) query.set(key, params.get(key));
  query.set('limit', '12');
  const data = await api(`/admin/quizzes?${query}`);
  const rows = data.quizzes.map((quiz) => `<tr><td><strong>${escapeHtml(quiz.title)}</strong><span class="table-sub">${escapeHtml(quiz.category)} · ${escapeHtml(quiz.difficulty)}</span></td><td>${quiz.questions.length}</td><td>${number(quiz.durationMinutes)} min · ${number(quiz.totalMarks)} marks</td><td><span class="tag ${quiz.status === 'published' ? 'success' : 'warning'}">${escapeHtml(quiz.status)}</span></td><td>${formatDate(quiz.updatedAt)}</td><td><div class="inline-actions"><a class="button secondary small" href="/admin/quizzes/${encodeURIComponent(quiz._id)}/edit" data-nav>Edit</a><button class="button secondary small" data-action="admin-status" data-id="${escapeHtml(quiz._id)}" data-status="${quiz.status === 'published' ? 'draft' : 'published'}">${quiz.status === 'published' ? 'Unpublish' : 'Publish'}</button><button class="button danger small" data-action="archive-quiz" data-id="${escapeHtml(quiz._id)}">Archive</button></div></td></tr>`).join('');
  return `${pageHeading('Content', 'Quiz management', 'Create, edit, publish, and archive quizzes.', '<a class="button" href="/admin/quizzes/new" data-nav>+ Create quiz</a>')}
    <form class="toolbar" id="admin-quiz-search"><div class="field"><label for="admin-quiz-search-input">Search quiz</label><input class="input" id="admin-quiz-search-input" name="search" value="${escapeHtml(params.get('search') || '')}" placeholder="Quiz title"></div><div class="field"><label for="admin-category">Category</label><input class="input" id="admin-category" name="category" value="${escapeHtml(params.get('category') || '')}"></div><div class="field"><label for="admin-status-filter">Status</label><select class="select" id="admin-status-filter" name="status"><option value="">All statuses</option><option value="draft" ${params.get('status') === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${params.get('status') === 'published' ? 'selected' : ''}>Published</option></select></div><button class="button" type="submit">Apply filters</button></form>
    <div class="section-title"><div><h2>${number(data.pagination.total)} quizzes</h2><p>Archived quizzes are hidden from this list but their existing results are retained.</p></div></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Quiz</th><th>Questions</th><th>Duration / marks</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>${paginationControls(data.pagination)}` : emptyState('No quizzes found', 'Create a quiz or change your filters.', '<a class="button" href="/admin/quizzes/new" data-nav>Create quiz</a>')}`;
}

async function quizEditor(id = null) {
  let quiz = null;
  if (id) ({ quiz } = await api(`/admin/quizzes/${encodeURIComponent(id)}`));
  state.quizDraft = quiz
    ? quiz.questions.map((question) => ({
      text: question.text,
      marks: question.marks,
      correctIndex: question.correctIndex,
      options: question.options.map((option) => option.text),
    }))
    : [{ text: '', marks: 1, correctIndex: 0, options: ['', ''] }];
  const fieldValue = (key, fallback = '') => escapeHtml(quiz?.[key] ?? fallback);
  const questionMarkup = state.quizDraft.map(questionEditorMarkup).join('');
  return `${pageHeading('Quiz builder', id ? 'Edit quiz' : 'Create a quiz', 'Add clear questions, answer options, marks, and publication settings.', '<a class="button secondary" href="/admin/quizzes" data-nav>Back to quizzes</a>')}
    <form class="card" id="quiz-editor" data-quiz-id="${escapeHtml(id || '')}" novalidate>
      <div class="field-grid">
        <div class="field"><label for="quiz-title">Title</label><input class="input" id="quiz-title" name="title" value="${fieldValue('title')}" required maxlength="160"></div>
        <div class="field"><label for="quiz-category">Category</label><input class="input" id="quiz-category" name="category" value="${fieldValue('category')}" required maxlength="80"></div>
        <div class="field full"><label for="quiz-description">Description</label><textarea class="textarea" id="quiz-description" name="description" maxlength="2000">${fieldValue('description')}</textarea></div>
        <div class="field"><label for="quiz-difficulty-level">Difficulty</label><select class="select" id="quiz-difficulty-level" name="difficulty">${['easy', 'medium', 'hard'].map((difficulty) => `<option value="${difficulty}" ${quiz?.difficulty === difficulty ? 'selected' : ''}>${difficulty[0].toUpperCase() + difficulty.slice(1)}</option>`).join('')}</select></div>
        <div class="field"><label for="quiz-duration">Duration (minutes)</label><input class="input" id="quiz-duration" name="durationMinutes" type="number" min="1" max="240" value="${fieldValue('durationMinutes', '10')}" required></div>
        <div class="field"><label for="quiz-passing-score">Passing score (marks)</label><input class="input" id="quiz-passing-score" name="passingScore" type="number" min="0" value="${fieldValue('passingScore', '0')}"><small class="form-note">Use 0 if this quiz has no pass/fail threshold.</small></div>
        <div class="field"><label for="quiz-status">Save as</label><select class="select" id="quiz-status" name="status"><option value="draft" ${quiz?.status !== 'published' ? 'selected' : ''}>Draft</option><option value="published" ${quiz?.status === 'published' ? 'selected' : ''}>Published</option></select></div>
        <div class="field full"><label for="quiz-instructions">Instructions</label><textarea class="textarea" id="quiz-instructions" name="instructions" maxlength="4000">${fieldValue('instructions')}</textarea></div>
        <label class="check-row field full"><input name="allowReview" type="checkbox" ${quiz?.allowReview !== false ? 'checked' : ''}> Allow students to review correct answers after submission</label>
      </div>
      <div class="section-title"><div><h2>Questions</h2><p>Each question needs at least two unique options.</p></div><button class="button secondary small" type="button" data-action="add-question">+ Add question</button></div>
      <div id="question-list">${questionMarkup}</div>
      <p class="form-error" id="form-error" aria-live="polite"></p>
      <div class="form-actions"><a class="button secondary" href="/admin/quizzes" data-nav>Cancel</a><button class="button" type="submit">${id ? 'Save changes' : 'Create quiz'}</button></div>
    </form>`;
}

function questionEditorMarkup(question, index) {
  return `<section class="question-editor" data-question="${index}">
    <div class="question-editor-head"><strong>Question ${index + 1}</strong><button class="button danger small" type="button" data-action="remove-question" data-question="${index}">Remove question</button></div>
    <div class="field-grid"><div class="field full"><label for="question-text-${index}">Question text</label><textarea class="textarea" id="question-text-${index}" data-question-text maxlength="2000" required>${escapeHtml(question.text)}</textarea></div>
      <div class="field"><label for="question-marks-${index}">Marks</label><input class="input" id="question-marks-${index}" data-question-marks type="number" min="1" max="1000" value="${escapeHtml(question.marks)}" required></div>
      <div class="field"><label for="correct-index-${index}">Correct option</label><select class="select" id="correct-index-${index}" data-correct-index>${question.options.map((_, optionIndex) => `<option value="${optionIndex}" ${optionIndex === question.correctIndex ? 'selected' : ''}>Option ${optionIndex + 1}</option>`).join('')}</select></div>
    </div>
    <div class="section-title"><div><h3>Answer options</h3></div><button class="button secondary small" type="button" data-action="add-option" data-question="${index}">+ Add option</button></div>
    ${question.options.map((option, optionIndex) => `<div class="option-row"><div class="field"><label for="option-${index}-${optionIndex}">Option ${optionIndex + 1}</label><input class="input" id="option-${index}-${optionIndex}" data-option-text value="${escapeHtml(option)}" maxlength="300" required></div><button class="button danger small" type="button" aria-label="Remove option ${optionIndex + 1}" data-action="remove-option" data-question="${index}" data-option="${optionIndex}">Remove</button></div>`).join('')}
  </section>`;
}

function syncQuestionDraft() {
  state.quizDraft = [...document.querySelectorAll('.question-editor')].map((section) => ({
    text: section.querySelector('[data-question-text]').value,
    marks: Number(section.querySelector('[data-question-marks]').value) || 1,
    correctIndex: Number(section.querySelector('[data-correct-index]').value) || 0,
    options: [...section.querySelectorAll('[data-option-text]')].map((input) => input.value),
  }));
}

function renderQuestionEditors() {
  const container = document.querySelector('#question-list');
  if (container) container.innerHTML = state.quizDraft.map(questionEditorMarkup).join('');
}

async function updateQuizStatus(id, status) {
  await api(`/admin/quizzes/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  notify(`Quiz ${status === 'published' ? 'published' : 'unpublished'}.`);
  render();
}

async function archiveQuiz(id) {
  if (!window.confirm('Archive this quiz? It will no longer be available to students. Existing attempts and reports will be retained.')) return;
  await api(`/admin/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  notify('Quiz archived. Previous results were retained.');
  render();
}

async function studentList() {
  const params = getQuery();
  const query = new URLSearchParams();
  for (const key of ['search', 'department', 'page']) if (params.get(key)) query.set(key, params.get(key));
  query.set('limit', '15');
  const data = await api(`/admin/students?${query}`);
  const rows = data.students.map((student) => `<tr><td><strong>${escapeHtml(student.name)}</strong><span class="table-sub">${escapeHtml(student.email)}</span></td><td>${escapeHtml(student.registerNumber || '—')}</td><td>${escapeHtml(student.department || '—')}</td><td><span class="tag ${student.isActive ? 'success' : 'danger'}">${student.isActive ? 'Active' : 'Inactive'}</span></td><td>${formatDate(student.createdAt)}</td><td><div class="inline-actions"><a class="button secondary small" href="/admin/students/${encodeURIComponent(student.id)}" data-nav>View</a><button class="button secondary small" data-action="student-status" data-id="${escapeHtml(student.id)}" data-active="${student.isActive}">${student.isActive ? 'Deactivate' : 'Activate'}</button></div></td></tr>`).join('');
  return `${pageHeading('Accounts', 'Student management', 'Search, review, and manage student accounts.')}
    <form class="toolbar" id="student-search"><div class="field"><label for="student-search-input">Search students</label><input class="input" id="student-search-input" name="search" value="${escapeHtml(params.get('search') || '')}" placeholder="Name, email, or register number"></div><div class="field"><label for="student-department">Department</label><input class="input" id="student-department" name="department" value="${escapeHtml(params.get('department') || '')}" placeholder="Department"></div><button class="button" type="submit">Search</button></form>
    <div class="section-title"><div><h2>${number(data.pagination.total)} students</h2><p>Administrator accounts are not exposed to student management.</p></div></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Register number</th><th>Department</th><th>Account</th><th>Registered</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>${paginationControls(data.pagination)}` : emptyState('No students found', 'Try changing your search or filters.')}`;
}

async function studentDetails(id) {
  const { student, attempts, totalAttempts } = await api(`/admin/students/${encodeURIComponent(id)}`);
  const rows = attempts.map((attempt) => `<tr><td>${escapeHtml(attempt.quiz?.title || 'Quiz')}</td><td>${number(attempt.score)}/${number(attempt.totalMarks)} · ${number(attempt.percentage, 1)}%</td><td><span class="tag">${escapeHtml(attempt.status.replace('_', ' '))}</span></td><td>${formatDate(attempt.createdAt)}</td></tr>`).join('');
  return `${pageHeading('Student record', student.name, 'Profile information and recent quiz attempts.', '<a class="button secondary" href="/admin/students" data-nav>Back to students</a>')}
    <div class="card"><div class="field-grid"><div class="field"><span class="label">Email</span><div>${escapeHtml(student.email)}</div></div><div class="field"><span class="label">Register number</span><div>${escapeHtml(student.registerNumber || '—')}</div></div><div class="field"><span class="label">Department</span><div>${escapeHtml(student.department || '—')}</div></div><div class="field"><span class="label">Status</span><div>${student.isActive ? 'Active' : 'Inactive'}</div></div></div></div>
    <div class="section-title"><div><h2>Quiz attempts</h2><p>${number(totalAttempts)} total attempts · showing latest ${attempts.length}</p></div></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Quiz</th><th>Score</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState('No attempts yet', 'This student has not started a quiz.')}`;
}

async function adminAttempts() {
  const params = getQuery();
  const query = new URLSearchParams({ limit: '15' });
  for (const key of ['status', 'quizId', 'studentId', 'page']) if (params.get(key)) query.set(key, params.get(key));
  const data = await api(`/admin/attempts?${query}`);
  const rows = data.attempts.map((attempt) => `<tr><td><strong>${escapeHtml(attempt.student?.name || 'Student')}</strong><span class="table-sub">${escapeHtml(attempt.student?.registerNumber || attempt.student?.email || '')}</span></td><td>${escapeHtml(attempt.quiz?.title || 'Quiz')}</td><td>${attempt.status === 'submitted' ? `${number(attempt.score)}/${number(attempt.totalMarks)} · ${number(attempt.percentage, 1)}%` : '—'}</td><td><span class="tag">${escapeHtml(attempt.status.replace('_', ' '))}</span></td><td>${formatDate(attempt.createdAt)}</td></tr>`).join('');
  return `${pageHeading('Performance', 'Quiz attempts & results', 'Review submitted scores, in-progress attempts, and expirations.')}
    <form class="toolbar" id="attempt-search"><div class="field"><label for="attempt-status">Attempt status</label><select class="select" id="attempt-status" name="status"><option value="">All statuses</option>${[['in_progress', 'In progress'], ['submitted', 'Submitted'], ['expired', 'Expired']].map(([value, label]) => `<option value="${value}" ${params.get('status') === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div class="field"><label for="attempt-quiz-id">Quiz ID (optional)</label><input class="input" id="attempt-quiz-id" name="quizId" value="${escapeHtml(params.get('quizId') || '')}" placeholder="MongoDB quiz ID"></div><div class="field"><label for="attempt-student-id">Student ID (optional)</label><input class="input" id="attempt-student-id" name="studentId" value="${escapeHtml(params.get('studentId') || '')}" placeholder="MongoDB student ID"></div><button class="button" type="submit">Filter attempts</button></form>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Quiz</th><th>Score</th><th>Status</th><th>Started</th></tr></thead><tbody>${rows}</tbody></table></div>${paginationControls(data.pagination)}` : emptyState('No quiz attempts', 'Attempts will appear here after students start quizzes.')}`;
}

async function reportsPage() {
  const data = await api('/admin/reports');
  const rows = data.quizzes.map((quiz) => `<div class="review-row"><div class="question-editor-head"><strong>${escapeHtml(quiz.title || 'Archived quiz')}</strong><span>${number(quiz.attempts)} attempts · ${number(quiz.averagePercentage, 1)}% average</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(quiz.averagePercentage) || 0))}%"></div></div><small>${escapeHtml(quiz.category || 'Category unavailable')}</small></div>`).join('');
  return `${pageHeading('Insights', 'Reports & analytics', 'Performance information calculated from completed MongoDB attempts.')}
    <div class="grid stats-grid">${statCard('Submitted attempts', data.totalSubmitted, 'Scored quiz results', '✓')}${statCard('Average score', `${number(data.averagePercentage, 1)}%`, 'Across submitted attempts', '↗')}${statCard('Quiz reports', data.quizzes.length, 'Quizzes with scored attempts', '▥')}${statCard('Data source', 'Live', 'Values returned by the API', '◉')}</div>
    <div class="section-title"><div><h2>Quiz-wise performance</h2><p>Average percentage and total submissions by quiz</p></div></div>
    ${rows || emptyState('No report data yet', 'Quiz analytics will appear after students submit their quizzes.')}`;
}

async function updateStudentStatus(id, active) {
  const action = active ? 'deactivate' : 'activate';
  if (!window.confirm(`Are you sure you want to ${action} this student account?`)) return;
  await api(`/admin/students/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: !active }),
  });
  notify(`Student account ${active ? 'deactivated' : 'activated'}.`);
  render();
}

function renderAdminRoute(path) {
  if (path === '/admin' || path === '/admin/') return adminDashboard();
  if (path === '/admin/quizzes') return adminQuizList();
  if (path === '/admin/quizzes/new') return quizEditor();
  if (path === '/admin/students') return studentList();
  if (path === '/admin/attempts') return adminAttempts();
  if (path === '/admin/reports') return reportsPage();
  const editMatch = path.match(/^\/admin\/quizzes\/([^/]+)\/edit$/);
  if (editMatch) return quizEditor(decodeURIComponent(editMatch[1]));
  const studentMatch = path.match(/^\/admin\/students\/([^/]+)$/);
  if (studentMatch) return studentDetails(decodeURIComponent(studentMatch[1]));
  return Promise.resolve(`${pageHeading('Not found', 'Page not found', 'This page does not exist.')}<a class="button" href="/admin" data-nav>Admin dashboard</a>`);
}

document.addEventListener('input', (event) => {
  if (!event.target.closest('.question-editor')) return;
  syncQuestionDraft();
});

document.addEventListener('change', (event) => {
  if (!event.target.closest('.question-editor')) return;
  syncQuestionDraft();
});
