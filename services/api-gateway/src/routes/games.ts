import { Router, Request, Response } from 'express';
import { db } from '../services/database';

const router = Router();

// Get all active games
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id, name, display_name, description, version, authors, category, 
              thumbnail_url, created_at, updated_at
       FROM games
       WHERE is_active = true
       ORDER BY display_name`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get game details by name
router.get('/:gameName', async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    
    const result = await db.query(
      `SELECT * FROM games WHERE name = $1 AND is_active = true`,
      [gameName]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

// Get game leaderboard
router.get('/:gameName/leaderboard', async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await db.query(
      `SELECT l.player_initials, l.score, l.played_at
       FROM leaderboards l
       JOIN games g ON l.game_id = g.id
       WHERE g.name = $1
       ORDER BY l.score DESC, l.played_at ASC
       LIMIT $2`,
      [gameName, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit score to leaderboard
router.post('/:gameName/score', async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const { initials, score } = req.body;
    
    // Validate input
    if (!initials || !score) {
      return res.status(400).json({ error: 'Initials and score are required' });
    }
    
    if (initials.length > 3) {
      return res.status(400).json({ error: 'Initials must be 3 characters or less' });
    }
    
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Score must be a positive number' });
    }
    
    // Get game ID
    const gameResult = await db.query(
      `SELECT id FROM games WHERE name = $1 AND is_active = true`,
      [gameName]
    );
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const gameId = gameResult.rows[0].id;
    
    // Insert score
    const result = await db.query(
      `INSERT INTO leaderboards (game_id, player_initials, score)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [gameId, initials.toUpperCase(), score]
    );
    
    // Check if score made it to top 10
    const leaderboardResult = await db.query(
      `SELECT COUNT(*) as rank
       FROM leaderboards
       WHERE game_id = $1 AND (score > $2 OR (score = $2 AND played_at < $3))`,
      [gameId, score, result.rows[0].played_at]
    );
    
    const rank = parseInt(leaderboardResult.rows[0].rank) + 1;
    
    res.json({
      success: true,
      rank,
      isTopTen: rank <= 10,
      score: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Track game play start
router.post('/:gameName/play/start', async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const playerIdentifier = req.body.playerIdentifier || null;
    const clientIp = req.ip || req.socket.remoteAddress;
    
    const gameResult = await db.query(
      `SELECT id FROM games WHERE name = $1 AND is_active = true`,
      [gameName]
    );
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const gameId = gameResult.rows[0].id;
    
    const result = await db.query(
      `INSERT INTO game_plays (game_id, player_identifier, ip_address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [gameId, playerIdentifier, clientIp]
    );
    
    res.json({ playId: result.rows[0].id });
  } catch (error) {
    console.error('Error tracking game start:', error);
    res.status(500).json({ error: 'Failed to track game start' });
  }
});

// Track game play end
router.post('/:gameName/play/end', async (req: Request, res: Response) => {
  try {
    const { playId, completed, finalScore } = req.body;
    
    if (!playId) {
      return res.status(400).json({ error: 'Play ID is required' });
    }
    
    await db.query(
      `UPDATE game_plays
       SET ended_at = CURRENT_TIMESTAMP, completed = $1, final_score = $2
       WHERE id = $3`,
      [completed || false, finalScore || null, playId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking game end:', error);
    res.status(500).json({ error: 'Failed to track game end' });
  }
});

export default router;
