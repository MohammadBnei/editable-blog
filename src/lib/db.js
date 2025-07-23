import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Applies the database schema from sql/schema.sql
 */
export async function migrate() {
  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying database schema...');
  try {
    await query(schemaSql);
    console.log('Database schema applied successfully.');
  } catch (error) {
    console.error('Error applying database schema:', error);
    throw error;
  }
}

// Call migrate function when the module is loaded
// This ensures the schema is applied when the server starts
migrate().catch(err => {
  console.error('Failed to run database migrations on startup:', err);
  // Depending on your application's needs, you might want to exit here
  // process.exit(1);
});


// Optional: Close all connections when shutting down
process.on('SIGINT', () => {
  pool.end();
  console.log('PostgreSQL connection pool closed.');
});

process.on('SIGTERM', () => {
  pool.end();
  console.log('PostgreSQL connection pool closed.');
});
