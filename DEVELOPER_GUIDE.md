# BucStop Developer Guide

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- Docker and Docker Compose
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andersonjb1/BucStop.git
   cd BucStop
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings if needed
   ```

3. **Start with Docker Compose** (Recommended)
   ```bash
   docker-compose up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - API Gateway on port 3000
   - Web App on port 5173
   - Snake Game service on port 3001

4. **Access the application**
   - Web App: http://localhost:5173
   - API Gateway: http://localhost:3000
   - Snake Game: http://localhost:3001/play

### Manual Development Setup

If you prefer to run services individually:

1. **Start the database**
   ```bash
   docker-compose up database
   ```

2. **Install dependencies for all services**
   ```bash
   npm run install:all
   ```

3. **Run API Gateway**
   ```bash
   npm run dev:gateway
   ```

4. **Run Web App** (in another terminal)
   ```bash
   npm run dev:webapp
   ```

5. **Run Snake Game** (in another terminal)
   ```bash
   npm run dev:game-snake
   ```

## Project Structure

```
BucStop/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── database/
│   └── migrations/         # SQL migration files
├── services/
│   ├── api-gateway/       # Express.js API Gateway
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── web-app/           # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   └── types/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── game-snake/        # Snake game service
│       ├── public/
│       ├── server.js
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

## Architecture

### Microservices Overview

1. **API Gateway** (Port 3000)
   - Handles all API requests
   - Implements access control (IP-based)
   - Manages database connections
   - Routes to game services

2. **Web App** (Port 5173)
   - React-based single-page application
   - Responsive design
   - Game browsing and playing interface
   - Statistics dashboard

3. **Game Services** (Port 3001+)
   - Self-contained HTML/CSS/JS games
   - Served via Express.js
   - Communicates with API Gateway for scores

4. **PostgreSQL Database** (Port 5432)
   - Stores games, leaderboards, analytics
   - Migration-based schema management

## API Endpoints

### Games
- `GET /api/games` - List all active games
- `GET /api/games/:gameName` - Get game details
- `GET /api/games/:gameName/leaderboard` - Get top scores
- `POST /api/games/:gameName/score` - Submit a score
- `POST /api/games/:gameName/play/start` - Track game start
- `POST /api/games/:gameName/play/end` - Track game end

### Analytics
- `GET /api/analytics/stats` - Get overall statistics
- `GET /api/analytics/top-games` - Get most played games
- `GET /api/analytics/trends/daily` - Get daily play trends

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - List feedback (admin)

### Health
- `GET /health` - Service health check

## Database Schema

### Tables
- `games` - Game registry
- `leaderboards` - High scores
- `access_logs` - Security and analytics
- `game_plays` - Play session tracking
- `feedback` - User feedback
- `validated_devices` - Device validation

See `database/migrations/01_init_schema.sql` for full schema.

## Adding a New Game

1. **Create game service directory**
   ```bash
   mkdir -p services/game-yourgame
   cd services/game-yourgame
   ```

2. **Create package.json**
   ```json
   {
     "name": "game-yourgame",
     "version": "1.0.0",
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

3. **Create server.js**
   ```javascript
   const express = require('express');
   const app = express();
   
   app.use(express.static('public'));
   app.get('/health', (req, res) => res.json({ status: 'healthy' }));
   app.get('/play', (req, res) => res.sendFile(__dirname + '/public/index.html'));
   
   app.listen(3002, () => console.log('Game running on port 3002'));
   ```

4. **Create your game in public/ directory**
   - `public/index.html`
   - `public/style.css`
   - `public/game.js`

5. **Implement score submission**
   ```javascript
   window.parent.postMessage({
     type: 'SUBMIT_SCORE',
     initials: 'ABC',
     score: 1000
   }, '*');
   ```

6. **Register in database**
   ```sql
   INSERT INTO games (name, display_name, description, instructions, version, authors, category, service_url)
   VALUES ('yourgame', 'Your Game', '...', '...', '1.0.0', 'Your Name', 'Arcade', 'http://game-yourgame:3002');
   ```

7. **Add to docker-compose.yml**

## Testing

### Run Linters
```bash
npm run lint
```

### Run Tests
```bash
npm run test
```

### Manual Testing
1. Start all services
2. Visit http://localhost:5173
3. Test game browsing
4. Test game playing
5. Test score submission
6. Test leaderboards

## Deployment

### Production Environment Variables
Update these for production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database connection
- `ALLOWED_CIDR_BLOCKS` - ETSU network IP ranges
- `VITE_API_URL` - Production API URL

### Deploy with Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD
GitHub Actions automatically:
- Lints code on push
- Runs tests
- Builds Docker images
- Runs integration tests

## Security Considerations

1. **Access Control**
   - IP-based restrictions via CIDR blocks
   - Device validation for extended access
   - Access logging for monitoring

2. **Input Validation**
   - Score validation
   - Initials length checks
   - SQL injection prevention (parameterized queries)

3. **Content Security**
   - Games run in sandboxed iframes
   - XSS protection via headers
   - No PII collection from players

## Troubleshooting

### Database connection fails
```bash
# Check if database is running
docker-compose ps database

# View database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### API Gateway won't start
```bash
# Check logs
docker-compose logs api-gateway

# Verify environment variables
cat .env

# Rebuild image
docker-compose build api-gateway
```

### Web App build fails
```bash
# Clear node_modules and rebuild
cd services/web-app
rm -rf node_modules dist
npm install
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linters and tests
4. Submit a pull request
5. Wait for CI/CD checks to pass

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/Andersonjb1/BucStop/issues
- ETSU Computing Department: https://www.etsu.edu/cbat/computing/
