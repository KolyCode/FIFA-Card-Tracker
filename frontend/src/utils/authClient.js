const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Dispatch a custom event so same-tab listeners are notified of auth changes.
function dispatchAuthChange(event, session) {
  window.dispatchEvent(new CustomEvent('authStateChange', { detail: { event, session } }));
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${API_URL}/api/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Login failed.' } };

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email }));
        dispatchAuthChange('SIGNED_IN', { user: { email: data.email } });
        return { error: null };
      } catch {
        return { error: { message: 'Network error. Is the server running?' } };
      }
    },

    async signUp({ email, password }) {
      try {
        const res = await fetch(`${API_URL}/api/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Registration failed.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error. Is the server running?' } };
      }
    },

    async signOut() {
      const token = getStoredToken();
      if (token) {
        try {
          await fetch(`${API_URL}/api/auth/logout/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` },
          });
        } catch {
          // ignore network errors on logout
        }
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      dispatchAuthChange('SIGNED_OUT', null);
    },

    async getUser() {
      const token = getStoredToken();
      if (!token) return { data: { user: null } };

      try {
        const res = await fetch(`${API_URL}/api/auth/me/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          return { data: { user: null } };
        }
        const data = await res.json();
        return { data: { user: { email: data.email, id: data.id } } };
      } catch {
        // Fall back to stored user if server is unreachable
        const user = getStoredUser();
        return { data: { user } };
      }
    },

    onAuthStateChange(callback) {
      const handler = (e) => callback(e.detail.event, e.detail.session);
      window.addEventListener('authStateChange', handler);
      // Also react to storage changes from other tabs
      const storageHandler = (e) => {
        if (e.key === TOKEN_KEY) {
          if (e.newValue) {
            callback('SIGNED_IN', { user: getStoredUser() });
          } else {
            callback('SIGNED_OUT', null);
          }
        }
      };
      window.addEventListener('storage', storageHandler);
      return {
        data: {
          subscription: {
            unsubscribe() {
              window.removeEventListener('authStateChange', handler);
              window.removeEventListener('storage', storageHandler);
            },
          },
        },
      };
    },
  },

  collection: {
    async getAll() {
      const token = getStoredToken();
      if (!token) return { data: [], error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/collection/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { data: [], error: { message: 'Failed to fetch collection.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: [], error: { message: 'Network error.' } };
      }
    },

    async add(playerId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/collection/add/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ player_id: playerId }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to add player.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async remove(playerId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/collection/${playerId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { error: { message: 'Failed to remove player.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },
  },
};

