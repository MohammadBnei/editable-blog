import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.VITE_DB_URL
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

// Optional: Close all connections when shutting down
process.on('SIGINT', () => {
  pool.end();
});