const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

function setLoginMessage(text, isError = false) {
  if (!loginMessage) return;
  loginMessage.textContent = text;
  loginMessage.style.color = isError ? '#8f2b2b' : '#38514a';
}

// Auto-redirect removed to prevent loop. User must login explicitly.

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    setLoginMessage('Logging in...');

    try {
      const result = await window.ownerAuth.login(email, password);

      if (result && result.ok) {
        setLoginMessage('Login successful.');
        window.location.replace('/owner/dashboard.html');
        return;
      }

      setLoginMessage(result?.message || 'Invalid email or password.', true);
    } catch (err) {
      console.error(err);
      setLoginMessage('An unexpected error occurred.', true);
    }
  });
}
