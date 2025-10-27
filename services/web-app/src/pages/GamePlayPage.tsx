import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { api } from '../services/api';
import '../styles/GamePlayPage.css';

function GamePlayPage() {
  const { gameName } = useParams<{ gameName: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [playId, setPlayId] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (gameName) {
      loadGame();
    }

    // Listen for score submissions from the game
    window.addEventListener('message', handleGameMessage);
    
    return () => {
      window.removeEventListener('message', handleGameMessage);
      // Track game end when leaving the page
      // Use navigator.sendBeacon for reliable fire-and-forget analytics on unload
      if (playId && gameName) {
        const url = `/api/games/${encodeURIComponent(gameName)}/play/end`;
        const payload = JSON.stringify({
          playId,
          completed: false
        });
        
        // Try sendBeacon first, fall back to fetch if not available
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          api.endGamePlay(gameName, playId, false);
        }
      }
    };
  }, [gameName, playId]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const gameData = await api.getGameDetails(gameName!);
      setGame(gameData);
      
      // Track game start
      const { playId: id } = await api.startGamePlay(gameName!);
      setPlayId(id);
    } catch (err) {
      console.error('Error loading game:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameMessage = async (event: MessageEvent) => {
    // Validate origin for security - only accept messages from game service
    if (!game || !event.origin.includes(new URL(game.service_url).hostname)) {
      console.warn('Rejected message from unauthorized origin:', event.origin);
      return;
    }
    
    // Handle score submission messages from the game iframe
    if (event.data.type === 'SUBMIT_SCORE') {
      const { initials, score } = event.data;
      try {
        const result = await api.submitScore(gameName!, initials, score);
        
        if (playId) {
          await api.endGamePlay(gameName!, playId, true, score);
        }
        
        // Notify game of successful submission with specific origin
        const targetOrigin = new URL(game.service_url).origin;
        iframeRef.current?.contentWindow?.postMessage({
          type: 'SCORE_SUBMITTED',
          result
        }, targetOrigin);
        
        // Show result to user
        if (result.isTopTen) {
          alert(`Congratulations! You ranked #${result.rank} on the leaderboard!`);
        }
      } catch (err) {
        console.error('Error submitting score:', err);
        const targetOrigin = new URL(game.service_url).origin;
        iframeRef.current?.contentWindow?.postMessage({
          type: 'SCORE_ERROR',
          error: 'Failed to submit score'
        }, targetOrigin);
      }
    }
  };

  const handleExitGame = () => {
    if (playId) {
      api.endGamePlay(gameName!, playId, false);
    }
    navigate(`/game/${gameName}`);
  };

  if (loading || !game) {
    return (
      <div className="container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="game-play-container">
      <div className="game-play-header">
        <h2>{game.display_name}</h2>
        <button onClick={handleExitGame} className="exit-button">
          Exit Game
        </button>
      </div>
      
      <div className="game-frame-container">
        <iframe
          ref={iframeRef}
          src={`${game.service_url}/play`}
          className="game-frame"
          title={game.display_name}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}

export default GamePlayPage;
