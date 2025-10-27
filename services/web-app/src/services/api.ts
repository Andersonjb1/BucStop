const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async getGames() {
    const response = await fetch(`${API_BASE}/api/games`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  },

  async getGameDetails(gameName: string) {
    const response = await fetch(`${API_BASE}/api/games/${gameName}`);
    if (!response.ok) throw new Error('Failed to fetch game details');
    return response.json();
  },

  async getLeaderboard(gameName: string, limit = 10) {
    const response = await fetch(`${API_BASE}/api/games/${gameName}/leaderboard?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  async submitScore(gameName: string, initials: string, score: number) {
    const response = await fetch(`${API_BASE}/api/games/${gameName}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initials, score })
    });
    if (!response.ok) throw new Error('Failed to submit score');
    return response.json();
  },

  async startGamePlay(gameName: string) {
    const response = await fetch(`${API_BASE}/api/games/${gameName}/play/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to track game start');
    return response.json();
  },

  async endGamePlay(gameName: string, playId: number, completed: boolean, finalScore?: number) {
    const response = await fetch(`${API_BASE}/api/games/${gameName}/play/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playId, completed, finalScore })
    });
    if (!response.ok) throw new Error('Failed to track game end');
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_BASE}/api/analytics/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async submitFeedback(data: {
    gameName?: string;
    type: string;
    subject: string;
    message: string;
  }) {
    const response = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
};
