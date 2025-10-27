import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { accessControlMiddleware } from './middleware/accessControl';
import { errorHandler } from './middleware/errorHandler';
import gamesRouter from './routes/games';
import analyticsRouter from './routes/analytics';
import feedbackRouter from './routes/feedback';
import { db } from './services/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply access control middleware to all routes except health check
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return accessControlMiddleware(req, res, next);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/feedback', feedbackRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'BucStop API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      games: '/api/games',
      analytics: '/api/analytics',
      feedback: '/api/feedback'
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.end();
    process.exit(0);
  });
});

export default app;
