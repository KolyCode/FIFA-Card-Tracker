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
        return { data: { user: { email: data.email, id: data.id, trade_banned: data.trade_banned } } };
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

  players: {
    async getAll() {
      try {
        const res = await fetch(`${API_URL}/api/players/`);
        if (!res.ok) return { data: [], error: { message: 'Failed to fetch players.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: [], error: { message: 'Network error.' } };
      }
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

  groups: {
    async getAll() {
      const token = getStoredToken();
      if (!token) return { data: [], error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { data: [], error: { message: 'Failed to fetch groups.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: [], error: { message: 'Network error.' } };
      }
    },

    async create(name, description) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/create/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to create group.' } };
        return { data, error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async join(groupId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/join/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ group_id: groupId }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to join group.' } };
        return { data, error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async leave(groupId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/leave/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { error: { message: 'Failed to leave group.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async inviteMember(groupId, username) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/members/invite/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ group_id: groupId, username }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to send invite.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async getInvites() {
      const token = getStoredToken();
      if (!token) return { data: [], error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/invites/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { data: [], error: { message: 'Failed to fetch invites.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: [], error: { message: 'Network error.' } };
      }
    },

    async respondToInvite(inviteId, action) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/invites/${inviteId}/respond/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to respond to invite.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async removeMember(groupId, userId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/${groupId}/members/${userId}/remove/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { error: { message: 'Failed to remove member.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async promoteAdmin(groupId, userId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/admins/promote/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ group_id: groupId, user_id: userId }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to promote admin.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async demoteAdmin(groupId, userId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/groups/admins/demote/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({ group_id: groupId, user_id: userId }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to demote admin.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },
  },

  trades: {
    async getAll() {
      const token = getStoredToken();
      if (!token) return { data: { incoming: [], outgoing: [] }, error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/trades/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { data: { incoming: [], outgoing: [] }, error: { message: 'Failed to fetch trades.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: { incoming: [], outgoing: [] }, error: { message: 'Network error.' } };
      }
    },

    async create(groupId, toUserId, offeredPlayerId, requestedPlayerId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/trades/create/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify({
            group_id: groupId,
            to_user_id: toUserId,
            offered_player_id: offeredPlayerId,
            requested_player_id: requestedPlayerId,
          }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to create trade.' } };
        return { data, error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },

    async respond(tradeId, action, offeredPlayerId, requestedPlayerId) {
      const token = getStoredToken();
      if (!token) return { error: { message: 'Not logged in.' } };
      try {
        const body = { action };
        if (offeredPlayerId) body.offered_player_id = offeredPlayerId;
        if (requestedPlayerId) body.requested_player_id = requestedPlayerId;
        const res = await fetch(`${API_URL}/api/trades/${tradeId}/respond/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Failed to respond to trade.' } };
        return { error: null };
      } catch {
        return { error: { message: 'Network error.' } };
      }
    },
  },

  users: {
    async getCollection(userId) {
      const token = getStoredToken();
      if (!token) return { data: [], error: { message: 'Not logged in.' } };
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}/collection/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) return { data: [], error: { message: 'Failed to fetch user collection.' } };
        const data = await res.json();
        return { data, error: null };
      } catch {
        return { data: [], error: { message: 'Network error.' } };
      }
    },
  },
};

