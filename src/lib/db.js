import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
import { schema } from './schema';
import { applyMigrations } from './migrations';

const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export async function query(q, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(q, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Applies the database schema from sql/schema.sql
 */
export async function migrate() {
  try {
    // Apply the base schema first (e.g., for initial setup)
    await query(schema); // This will create tables if they don't exist
    console.log('Base database schema ensured.');
    // Then apply incremental migrations
    await applyMigrations();
  } catch (error) {
    console.error('Error applying database schema:', error);
    throw error;
  }
}

// Optional: Close all connections when shutting down
process.on('SIGINT', () => {
  pool.end();
  console.log('PostgreSQL connection pool closed.');
});

process.on('SIGTERM', () => {
  pool.end();
  console.log('PostgreSQL connection pool closed.');
});
