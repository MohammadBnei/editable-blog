import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
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
    // Apply incremental migrations
    await applyMigrations();
    console.log('Database migrations applied.');
  } catch (error) {
    console.error('Error applying database migrations:', error);
    throw error;
  }
}

process.on('SIGTERM', async () => {
    try {
        await pool.end();
        console.log('PostgreSQL connection pool closed.');
    } catch (error) {
        console.error('Failed to close pool:', error);
    }
});