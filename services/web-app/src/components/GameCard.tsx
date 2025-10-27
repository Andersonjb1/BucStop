import { Link } from 'react-router-dom';
import { Game } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: Game;
}

function GameCard({ game }: GameCardProps) {
  return (
    <Link to={`/game/${game.name}`} className="game-card">
      <div className="game-card-image">
        {game.thumbnail_url ? (
          <img src={game.thumbnail_url} alt={game.display_name} />
        ) : (
          <div className="game-card-placeholder">🎮</div>
        )}
      </div>
      <div className="game-card-content">
        <h3>{game.display_name}</h3>
        <p className="game-card-description">{game.description}</p>
        <div className="game-card-meta">
          <span className="game-version">v{game.version}</span>
          <span className="game-category">{game.category}</span>
        </div>
      </div>
    </Link>
  );
}

export default GameCard;
