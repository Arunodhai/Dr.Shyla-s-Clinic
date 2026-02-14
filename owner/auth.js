(function setupOwnerAuth() {
  const authStorageKey = 'dr_shyla_owner_auth_v1';
  const authSessionKey = 'dr_shyla_owner_session_v1';
  const defaultOwnerUsername = 'drshylaclinic';
  const defaultOwnerPassword = 'drshyla@123';

  function getAuth() {
    try {
      const auth = JSON.parse(localStorage.getItem(authStorageKey) || '{}');
      if (typeof auth.username === 'string' && typeof auth.password === 'string') {
        return auth;
      }
    } catch {}
    return { username: defaultOwnerUsername, password: defaultOwnerPassword };
  }

  function saveAuth(auth) {
    localStorage.setItem(authStorageKey, JSON.stringify(auth));
  }

  function ensureAuthSetup() {
    if (!localStorage.getItem(authStorageKey)) {
      saveAuth({ username: defaultOwnerUsername, password: defaultOwnerPassword });
    }
  }

  function isAuthenticated() {
    return sessionStorage.getItem(authSessionKey) === '1';
  }

  function login(username, password) {
    const auth = getAuth();
    if (username === auth.username && password === auth.password) {
      sessionStorage.setItem(authSessionKey, '1');
      return { ok: true };
    }
    return { ok: false, message: 'Invalid username or password.' };
  }

  function logout() {
    sessionStorage.removeItem(authSessionKey);
  }

  function updatePassword(currentPassword, newPassword) {
    const auth = getAuth();
    if (auth.password !== currentPassword) {
      return { ok: false, message: 'Current password is incorrect.' };
    }
    if (newPassword.length < 6) {
      return { ok: false, message: 'New password must be at least 6 characters.' };
    }
    saveAuth({ username: auth.username, password: newPassword });
    return { ok: true, message: 'Password updated successfully.' };
  }

  ensureAuthSetup();

  window.ownerAuth = {
    isAuthenticated,
    login,
    logout,
    updatePassword
  };
})();
