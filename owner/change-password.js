const passwordForm = document.getElementById('password-form');
const passwordMessage = document.getElementById('password-message');

function setPasswordMessage(text, isError = false) {
  if (!passwordMessage) return;
  passwordMessage.textContent = text;
  passwordMessage.style.color = isError ? '#8f2b2b' : '#38514a';
}

(async function initChangePassword() {
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    window.location.replace('/owner');
  }
})();

if (passwordForm) {
  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    const currentPassword = String(formData.get('current_password') || '');
    const newPassword = String(formData.get('new_password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirm password do not match.', true);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.', true);
      return;
    }

    setPasswordMessage('Verifying and updating password...');

    try {
      const result = await window.ownerAuth.updatePassword(currentPassword, newPassword);
      if (result && result.ok) {
        passwordForm.reset();
        setPasswordMessage('Password updated successfully.');
      } else {
        setPasswordMessage(result?.message || 'Could not update password.', true);
      }
    } catch (err) {
      console.error(err);
      setPasswordMessage('An unexpected error occurred.', true);
    }
  });
}
