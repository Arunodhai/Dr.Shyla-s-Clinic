(function setupOwnerAuth() {
  async function isAuthenticated() {
    if (!window.supabase) return false;
    // Force a fresh session check from server to be sure
    const { data, error } = await window.supabase.auth.getSession();
    if (error || !data.session) return false;
    return true;
  }

  async function login(email, password) {
    if (!window.supabase) return { ok: false, message: 'Supabase not initialized.' };
    const { data, error } = await window.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, data };
  }

  async function logout() {
    if (window.supabase) {
      await window.supabase.auth.signOut();
    }
  }

  // Update password functionality 
  async function updatePassword(currentPassword, newPassword) {
    if (!window.supabase) return { ok: false, message: 'Supabase not initialized.' };

    // 1. Get current user email
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user || !user.email) return { ok: false, message: 'User verification failed.' };

    // 2. Verify current password by re-authenticating
    const { error: signInError } = await window.supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      return { ok: false, message: 'Current password is incorrect.' };
    }

    // 3. If verified, update to new password
    const { error } = await window.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Password updated successfully.' };
  }

  window.ownerAuth = {
    isAuthenticated,
    login,
    logout,
    updatePassword
  };
})();
