(() => {
  const panels = {
    admin: 'adminLoginForm',
    adminSetup: 'adminSetupForm',
    user: 'userLoginForm',
    passwordChange: 'passwordChangeForm'
  };
  const message = document.getElementById('authMessage');

  async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('hermes_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers,
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return payload;
  }

  function showMessage(text, type = 'error') {
    const attempt = Number(message.dataset.attempt || 0) + 1;
    message.dataset.attempt = String(attempt);
    const isCredentialError = text === 'Wrong Username or Password';
    message.textContent = isCredentialError
      ? `Attempt ${attempt}: The username/email or password is still incorrect. Please check both and try again.`
      : `Attempt ${attempt}: ${text}`;
    message.className = `message ${type === 'success' ? 'success' : ''}`;
    message.classList.remove('message-refresh');
    void message.offsetWidth;
    message.classList.add('message-refresh');
  }

  function showPanel(panel) {
    Object.values(panels).forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(panels[panel] || panels.admin).classList.remove('hidden');
    const isAdmin = panel.startsWith('admin');
    const isPasswordChange = panel === 'passwordChange';
    document.getElementById('adminTab').classList.toggle('active', isAdmin);
    document.getElementById('userTab').classList.toggle('active', !isAdmin);
    document.querySelector('.auth-tabs').classList.toggle('hidden', isPasswordChange);
    document.getElementById('adminTab').setAttribute('aria-selected', String(isAdmin));
    document.getElementById('userTab').setAttribute('aria-selected', String(!isAdmin));
    message.className = 'message hidden';
    message.dataset.attempt = '0';
  }

  const reason = new URLSearchParams(window.location.search).get('reason');
  if (reason === 'session-expired') {
    showMessage('Your session expired or is no longer valid. Please sign in again before continuing.');
  }

  function setAuthenticatedUser(payload, form) {
    if (!payload.user) throw new Error('Authentication response was incomplete');
    if (payload.token) localStorage.setItem('hermes_token', payload.token);
    form.reset();
    if (payload.user.mustChangePassword) {
      showPanel('passwordChange');
    } else {
      window.location.assign('/');
    }
  }

  async function submitForm(event, path, fields) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      setAuthenticatedUser(await apiRequest(path, { method: 'POST', body: JSON.stringify(fields) }), form);
    } catch (error) {
      showMessage(error.message);
    } finally {
      submit.disabled = false;
    }
  }

  document.getElementById('adminTab').addEventListener('click', () => showPanel('admin'));
  document.getElementById('userTab').addEventListener('click', () => showPanel('user'));
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => showPanel(button.dataset.panel)));
  document.getElementById('adminLoginForm').addEventListener('submit', event => submitForm(event, '/api/auth/admin/login', {
    username: document.getElementById('adminLoginUsername').value.trim(),
    password: document.getElementById('adminLoginPassword').value
  }));
  document.getElementById('userLoginForm').addEventListener('submit', event => submitForm(event, '/api/auth/user/login', {
    username: document.getElementById('userLoginUsername').value.trim(),
    password: document.getElementById('userLoginPassword').value
  }));
  document.getElementById('adminSetupForm').addEventListener('submit', event => submitForm(event, '/api/auth/admin/setup', {
    username: document.getElementById('adminSetupUsername').value.trim(),
    displayName: document.getElementById('adminSetupName').value.trim(),
    email: document.getElementById('adminSetupEmail').value.trim(),
    password: document.getElementById('adminSetupPassword').value,
    setupCode: document.getElementById('adminSetupCode').value
  }));
  document.getElementById('passwordChangeForm').addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('newPassword').value;
    const confirmation = document.getElementById('confirmNewPassword').value;
    if (password !== confirmation) {
      showMessage('The new passwords do not match.');
      return;
    }
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      form.reset();
      window.location.assign('/');
    } catch (error) {
      showMessage(error.message);
    } finally {
      submit.disabled = false;
    }
  });

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          button.textContent = isPassword ? 'Hide' : 'Show';
          button.setAttribute('aria-label', isPassword ? 'Hide value' : 'Show value');
        }
      });
    });

    apiRequest('/api/auth/me').then(payload => {
    if (payload.user?.mustChangePassword) showPanel('passwordChange');
    else if (payload.user) window.location.replace('/');
  }).catch(() => {});
})();
