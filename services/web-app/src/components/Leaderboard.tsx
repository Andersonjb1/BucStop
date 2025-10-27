import { LeaderboardEntry } from '../types';
import '../styles/Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="leaderboard">
        <h3>🏆 Top 10 Leaderboard</h3>
        <p className="no-scores">No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>🏆 Top 10 Leaderboard</h3>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span className="rank-header">Rank</span>
          <span className="initials-header">Player</span>
          <span className="score-header">Score</span>
        </div>
        {entries.map((entry, index) => (
          <div key={index} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
            <span className="rank">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </span>
            <span className="initials">{entry.player_initials}</span>
            <span className="score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
