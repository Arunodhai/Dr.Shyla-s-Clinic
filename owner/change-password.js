const passwordForm = document.getElementById('password-form');
const passwordMessage = document.getElementById('password-message');

function setPasswordMessage(text, isError = false) {
  if (!passwordMessage) return;
  passwordMessage.textContent = text;
  passwordMessage.style.color = isError ? '#8f2b2b' : '#38514a';
}

(function initChangePassword() {
  const isLoggedIn = window.ownerAuth?.isAuthenticated?.();
  if (!isLoggedIn) {
    window.location.replace('index.html');
  }
})();

if (passwordForm) {
  passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    const currentPassword = String(formData.get('current_password') || '');
    const newPassword = String(formData.get('new_password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirm password do not match.', true);
      return;
    }

    const result = window.ownerAuth?.updatePassword?.(currentPassword, newPassword);
    if (!result?.ok) {
      setPasswordMessage(result?.message || 'Could not update password.', true);
      return;
    }

    passwordForm.reset();
    setPasswordMessage(result.message);
  });
}
