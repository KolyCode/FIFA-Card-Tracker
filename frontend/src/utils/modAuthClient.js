const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MOD_TOKEN_KEY = 'mod_token';
const MOD_USER_KEY = 'mod_user';

function getModToken() {
  return localStorage.getItem(MOD_TOKEN_KEY);
}

export const modAuth = {
  async login(username, password) {
    try {
      const res = await fetch(`${API_URL}/api/mod/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || 'Login failed.' } };
      localStorage.setItem(MOD_TOKEN_KEY, data.token);
      localStorage.setItem(MOD_USER_KEY, JSON.stringify({ username: data.username }));
      return { error: null };
    } catch {
      return { error: { message: 'Network error. Is the server running?' } };
    }
  },

  logout() {
    localStorage.removeItem(MOD_TOKEN_KEY);
    localStorage.removeItem(MOD_USER_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(MOD_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem(MOD_TOKEN_KEY);
  },
};

export const modApi = {
  async getAllGroups() {
    const token = getModToken();
    if (!token) return { data: [], error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/groups/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) return { data: [], error: { message: 'Failed to fetch groups.' } };
      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: [], error: { message: 'Network error.' } };
    }
  },

  async deleteGroup(groupId) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/groups/${groupId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: { message: data.error || 'Failed to delete group.' } };
      }
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async addMember(groupId, username) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/groups/members/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ group_id: groupId, username }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || 'Failed to add member.' } };
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async removeMember(groupId, userId) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/groups/${groupId}/members/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: { message: data.error || 'Failed to remove member.' } };
      }
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async getAllPlayers() {
    const token = getModToken();
    if (!token) return { data: [], error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/players/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) return { data: [], error: { message: 'Failed to fetch players.' } };
      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: [], error: { message: 'Network error.' } };
    }
  },

  async addPlayer(playerData) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/players/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(playerData),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || 'Failed to add player.' } };
      return { data, error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async deletePlayer(playerId) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/players/${playerId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: { message: data.error || 'Failed to delete player.' } };
      }
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async getAllUsers() {
    const token = getModToken();
    if (!token) return { data: [], error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/users/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) return { data: [], error: { message: 'Failed to fetch users.' } };
      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: [], error: { message: 'Network error.' } };
    }
  },

  async setTradeBan(userId, banned) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/users/${userId}/trade-ban/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ banned }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || 'Failed to update trade ban.' } };
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },

  async deleteUser(userId) {
    const token = getModToken();
    if (!token) return { error: { message: 'Not logged in as moderator.' } };
    try {
      const res = await fetch(`${API_URL}/api/mod/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: { message: data.error || 'Failed to delete user.' } };
      }
      return { error: null };
    } catch {
      return { error: { message: 'Network error.' } };
    }
  },
};
