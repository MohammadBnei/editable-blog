// src/lib/migrations.js
import { query } from './db';

// List of migration scripts in order
const migrations = [
  // Initial schema is applied by src/lib/db.js's migrate function
  // Add subsequent migrations here
  {
    name: '20231027_add_lang_column_to_articles',
    sql: `
      BEGIN TRANSACTION;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en' NOT NULL;
      COMMIT;
    `
  },
  {
    name: '20231027_enforce_lang_code_length',
    sql: `
      BEGIN TRANSACTION;
      ALTER TABLE articles ADD CONSTRAINT lang_length_check CHECK (LENGTH(lang) = 2);
      UPDATE articles SET lang = 'en' WHERE lang IS NULL; -- Ensure existing rows have 'en' if lang was null
      COMMIT;
    `
  },
  {
    name: '20231027_add_unique_slug_lang_constraint',
    sql: `
      BEGIN TRANSACTION;
      -- Remove existing unique constraint on slug
      ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_key;
      -- Add unique constraint on (slug, lang)
      ALTER TABLE articles ADD CONSTRAINT unique_slug_lang UNIQUE (slug, lang);
      COMMIT;
    `
  },
  {
    name: '20231028_add_lang_to_pages_table',
    sql: `
      BEGIN TRANSACTION;
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'en' NOT NULL;
      -- Set default 'en' for existing rows where lang might be null (if column was added manually before this migration)
      UPDATE pages SET lang = 'en' WHERE lang IS NULL;
      -- Enforce 2-character length for lang column in pages table
      ALTER TABLE pages ADD CONSTRAINT pages_lang_length_check CHECK (LENGTH(lang) = 2);
      ALTER TABLE pages ADD CONSTRAINT unique_page_id_lang UNIQUE (page_id, lang);
      COMMIT;
    `
  }
  // Add more migrations here as objects { name: '...', sql: '...' }
];

// Table to keep track of applied migrations
const MIGRATIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS applied_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function applyMigrations() {
  await query(MIGRATIONS_TABLE_SQL); // Ensure migrations table exists

  for (const migration of migrations) {
    const checkResult = await query('SELECT name FROM applied_migrations WHERE name = $1', [migration.name]);
    if (checkResult.rows.length === 0) {
      console.log(`Applying migration: ${migration.name}`);
      try {
        await query(migration.sql);
        await query('INSERT INTO applied_migrations (name) VALUES ($1)', [migration.name]);
        console.log(`Migration ${migration.name} applied successfully.`);
      } catch (error) {
        console.error(`Error applying migration ${migration.name}:`, error);
        throw error; // Re-throw to stop the application if a migration fails
      }
    } else {
      console.log(`Migration ${migration.name} already applied.`);
    }
  }
}
