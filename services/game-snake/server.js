const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const GAME_NAME = process.env.GAME_NAME || 'snake';
const GAME_VERSION = process.env.GAME_VERSION || '1.0.0';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    game: GAME_NAME,
    version: GAME_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Serve the game
app.get('/play', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Snake game service running on port ${PORT}`);
  console.log(`Game: ${GAME_NAME} v${GAME_VERSION}`);
});
