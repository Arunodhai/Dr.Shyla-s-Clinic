const passwordToggles = document.querySelectorAll('[data-password-toggle]');
const eyeIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.5 0 9.7 4.5 10.9 6-1.2 1.5-5.4 6-10.9 6S2.3 12.5 1.1 11C2.3 9.5 6.5 5 12 5zm0 2C8 7 4.7 9.9 3.3 11 4.7 12.1 8 15 12 15s7.3-2.9 8.7-4C19.3 9.9 16 7 12 7zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>';
const eyeOffIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.3 3.7l18 16-1.3 1.4-3.2-2.8A12.5 12.5 0 0 1 12 19c-5.5 0-9.7-4.5-10.9-6a23 23 0 0 1 4.2-3.9L1 5zM12 7c4 0 7.3 2.9 8.7 4-0.5.4-1.2 1-2.1 1.6l-1.5-1.4A5.5 5.5 0 0 0 12 6.5c-.9 0-1.8.2-2.6.6L8 5.9c1.2-.6 2.5-.9 4-.9zm-5.1 4.5A5.5 5.5 0 0 0 12 17.5c.9 0 1.8-.2 2.6-.6l-1.7-1.5c-.3.1-.6.1-.9.1a3.5 3.5 0 0 1-3.5-3.5c0-.3 0-.6.1-.8L6.9 11.5z"/></svg>';

passwordToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const wrap = toggle.closest('.password-wrap');
    const field = wrap?.querySelector('[data-password-field]');
    if (!(field instanceof HTMLInputElement)) return;

    const isHidden = field.type === 'password';
    field.type = isHidden ? 'text' : 'password';
    toggle.innerHTML = isHidden ? eyeOffIcon : eyeIcon;
    toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    toggle.title = isHidden ? 'Hide password' : 'Show password';
  });
});
