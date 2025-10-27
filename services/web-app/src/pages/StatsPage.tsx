import { useState, useEffect } from 'react';
import { AnalyticsData } from '../types';
import { api } from '../services/api';
import '../styles/StatsPage.css';

function StatsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await api.getStats();
      setData(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="error">{error || 'Failed to load statistics'}</div>
        <button onClick={loadStats} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>BucStop Statistics</h2>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Visits</h3>
          <p className="stat-value">{data.siteStats.total_visits.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Unique Visitors</h3>
          <p className="stat-value">{data.siteStats.unique_visitors.toLocaleString()}</p>
        </div>
      </div>

      <div className="game-stats">
        <h3>Game Statistics</h3>
        {data.gameStats.length === 0 ? (
          <p>No game statistics available yet.</p>
        ) : (
          <div className="stats-table">
            <div className="stats-header">
              <span>Game</span>
              <span>Total Plays</span>
              <span>Unique Players</span>
              <span>Completions</span>
            </div>
            {data.gameStats.map((game) => (
              <div key={game.name} className="stats-row">
                <span className="game-name">{game.display_name}</span>
                <span>{game.total_plays}</span>
                <span>{game.unique_players}</span>
                <span>{game.completions}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsPage;
