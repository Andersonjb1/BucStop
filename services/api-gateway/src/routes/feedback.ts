import { Router, Request, Response } from 'express';
import { db } from '../services/database';

const router = Router();

// Submit feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { gameName, type, subject, message, playerIdentifier } = req.body;
    
    // Validate input
    if (!type || !subject || !message) {
      return res.status(400).json({ 
        error: 'Type, subject, and message are required' 
      });
    }
    
    let gameId = null;
    
    // If game name provided, get game ID
    if (gameName) {
      const gameResult = await db.query(
        `SELECT id FROM games WHERE name = $1 AND is_active = true`,
        [gameName]
      );
      
      if (gameResult.rows.length > 0) {
        gameId = gameResult.rows[0].id;
      }
    }
    
    // Insert feedback
    const result = await db.query(
      `INSERT INTO feedback (game_id, feedback_type, subject, message, player_identifier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, submitted_at`,
      [gameId, type, subject, message, playerIdentifier || null]
    );
    
    res.json({
      success: true,
      feedbackId: result.rows[0].id,
      submittedAt: result.rows[0].submitted_at
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback (for admin purposes - could be protected with auth)
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status || 'open';
    
    const result = await db.query(
      `SELECT f.*, g.display_name as game_name
       FROM feedback f
       LEFT JOIN games g ON f.game_id = g.id
       WHERE f.status = $1
       ORDER BY f.submitted_at DESC`,
      [status]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

export default router;
