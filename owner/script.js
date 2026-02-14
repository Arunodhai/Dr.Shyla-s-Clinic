const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

function setLoginMessage(text, isError = false) {
  if (!loginMessage) return;
  loginMessage.textContent = text;
  loginMessage.style.color = isError ? '#8f2b2b' : '#38514a';
}

(function initLoginPage() {
  const isLoggedIn = window.ownerAuth?.isAuthenticated?.();
  if (isLoggedIn) {
    window.location.replace('dashboard.html');
  }
})();

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');

    const result = window.ownerAuth?.login?.(username, password);
    if (result?.ok) {
      setLoginMessage('Login successful.');
      window.location.replace('dashboard.html');
      return;
    }

    setLoginMessage(result?.message || 'Invalid username or password.', true);
  });
}
