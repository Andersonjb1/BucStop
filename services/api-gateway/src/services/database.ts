import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://bucstop_user:bucstop_password@localhost:5432/bucstop';

export const db = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default db;
