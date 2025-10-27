-- BucStop Database Schema
-- Version 1.0.0

-- Table: games
-- Stores information about registered games in the system
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    authors VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    service_url VARCHAR(500) NOT NULL,
    release_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Table: leaderboards
-- Stores high scores for each game
CREATE TABLE IF NOT EXISTS leaderboards (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_initials VARCHAR(3) NOT NULL,
    score INTEGER NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    player_identifier VARCHAR(64),
    CONSTRAINT valid_initials CHECK (LENGTH(player_initials) <= 3)
);

-- Index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboards_game_score ON leaderboards(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_played_at ON leaderboards(played_at);

-- Table: access_logs
-- Tracks website access attempts for security and analytics
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    user_agent TEXT,
    access_granted BOOLEAN NOT NULL,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failure_reason VARCHAR(200)
);

-- Index for access log queries
CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at);

-- Table: game_plays
-- Tracks individual game play sessions
CREATE TABLE IF NOT EXISTS game_plays (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_identifier VARCHAR(64),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    final_score INTEGER,
    ip_address INET
);

-- Index for game play analytics
CREATE INDEX IF NOT EXISTS idx_game_plays_game_id ON game_plays(game_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_started_at ON game_plays(started_at);
CREATE INDEX IF NOT EXISTS idx_game_plays_player ON game_plays(player_identifier);

-- Table: feedback
-- Stores player feedback and trouble tickets
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
    feedback_type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    player_identifier VARCHAR(64),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open'
);

-- Index for feedback queries
CREATE INDEX IF NOT EXISTS idx_feedback_game_id ON feedback(game_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Table: validated_devices
-- Tracks devices validated via ETSU network for extended access
CREATE TABLE IF NOT EXISTS validated_devices (
    id SERIAL PRIMARY KEY,
    device_identifier VARCHAR(64) UNIQUE NOT NULL,
    first_validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    ip_address INET
);

-- Index for device validation queries
CREATE INDEX IF NOT EXISTS idx_validated_devices_identifier ON validated_devices(device_identifier);
CREATE INDEX IF NOT EXISTS idx_validated_devices_expires ON validated_devices(expires_at);

-- Insert initial game data (Snake game)
INSERT INTO games (name, display_name, description, instructions, version, authors, category, service_url, release_notes)
VALUES (
    'snake',
    'Classic Snake',
    'Guide the snake to eat food and grow longer. Don''t hit the walls or yourself!',
    'Use arrow keys or WASD to control the snake. Eat the red food to grow and earn points. The game ends if you hit a wall or yourself.',
    '1.0.0',
    'BucStop Team',
    'Arcade',
    'http://game-snake:3001',
    'Initial release of Classic Snake game'
) ON CONFLICT (name) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for games
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
