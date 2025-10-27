import { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import { Game } from '../types';
import { api } from '../services/api';
import '../styles/HomePage.css';

function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await api.getGames();
      setGames(data);
      setError(null);
    } catch (err) {
      setError('Failed to load games. Please try again later.');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={loadGames} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <h2>Welcome to BucStop</h2>
        <p>Play browser-based games created by ETSU students!</p>
      </div>

      {games.length === 0 ? (
        <div className="no-games">
          <p>No games available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
