import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import { Game, LeaderboardEntry } from '../types';
import { api } from '../services/api';
import '../styles/GameDetailPage.css';

function GameDetailPage() {
  const { gameName } = useParams<{ gameName: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gameName) {
      loadGameData();
    }
  }, [gameName]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const [gameData, leaderboardData] = await Promise.all([
        api.getGameDetails(gameName!),
        api.getLeaderboard(gameName!)
      ]);
      setGame(gameData);
      setLeaderboard(leaderboardData);
      setError(null);
    } catch (err) {
      setError('Failed to load game details. Please try again later.');
      console.error('Error loading game data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = () => {
    navigate(`/game/${gameName}/play`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading game details...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container">
        <div className="error">{error || 'Game not found'}</div>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Games
      </button>

      <div className="game-detail">
        <div className="game-detail-header">
          {game.thumbnail_url && (
            <img src={game.thumbnail_url} alt={game.display_name} className="game-detail-image" />
          )}
          <div className="game-detail-info">
            <h2>{game.display_name}</h2>
            <p className="game-authors">By {game.authors}</p>
            <div className="game-meta">
              <span className="badge">v{game.version}</span>
              <span className="badge">{game.category}</span>
            </div>
            <button onClick={handlePlayGame} className="play-button">
              ▶ Play Now
            </button>
          </div>
        </div>

        <div className="game-detail-content">
          <div className="game-description">
            <h3>About</h3>
            <p>{game.description}</p>
          </div>

          <div className="game-instructions">
            <h3>How to Play</h3>
            <p>{game.instructions}</p>
          </div>

          {game.release_notes && (
            <div className="game-notes">
              <h3>Release Notes</h3>
              <p>{game.release_notes}</p>
            </div>
          )}
        </div>

        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
}

export default GameDetailPage;
