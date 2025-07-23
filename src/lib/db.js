import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
import { schema } from './schema';

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
    await query(schema);
    console.log('Database schema applied successfully.');
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
