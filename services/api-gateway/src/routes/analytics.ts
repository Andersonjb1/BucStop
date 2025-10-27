import { Router, Request, Response } from 'express';
import { db } from '../services/database';

const router = Router();

// Get overall statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get total plays per game
    const playsResult = await db.query(
      `SELECT g.name, g.display_name, COUNT(gp.id) as total_plays,
              COUNT(DISTINCT gp.player_identifier) as unique_players,
              COUNT(CASE WHEN gp.completed = true THEN 1 END) as completions
       FROM games g
       LEFT JOIN game_plays gp ON g.id = gp.game_id
       WHERE g.is_active = true
       GROUP BY g.id, g.name, g.display_name
       ORDER BY total_plays DESC`
    );
    
    // Get total site visits
    const visitsResult = await db.query(
      `SELECT COUNT(*) as total_visits,
              COUNT(DISTINCT ip_address) as unique_visitors
       FROM access_logs
       WHERE access_granted = true`
    );
    
    res.json({
      gameStats: playsResult.rows,
      siteStats: visitsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get top played games
router.get('/top-games', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await db.query(
      `SELECT g.name, g.display_name, g.thumbnail_url,
              COUNT(gp.id) as play_count
       FROM games g
       LEFT JOIN game_plays gp ON g.id = gp.game_id
       WHERE g.is_active = true
       GROUP BY g.id, g.name, g.display_name, g.thumbnail_url
       ORDER BY play_count DESC
       LIMIT $1`,
      [limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top games:', error);
    res.status(500).json({ error: 'Failed to fetch top games' });
  }
});

// Get play trends (daily)
router.get('/trends/daily', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const result = await db.query(
      `SELECT DATE(started_at) as date,
              COUNT(*) as plays,
              COUNT(DISTINCT player_identifier) as unique_players
       FROM game_plays
       WHERE started_at >= CURRENT_DATE - INTERVAL '1 day' * $1
       GROUP BY DATE(started_at)
       ORDER BY date DESC`,
      [days]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    res.status(500).json({ error: 'Failed to fetch daily trends' });
  }
});

export default router;
