// src/lib/migrations.js
import { query } from './db';

// List of migration scripts in order
const migrations = [
  {
    name: '20231026_initial_schema',
    sql: `
      BEGIN TRANSACTION;

      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        expires TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pages (
        page_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      );

      -- counters (for view counts and everything you want to track anonymously)
      CREATE TABLE IF NOT EXISTS counters (
        counter_id TEXT PRIMARY KEY,
        count INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assets (
        asset_id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        size INTEGER NOT NULL,
        data BYTEA NOT NULL
      );

      CREATE TABLE IF NOT EXISTS articles (
        article_id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        teaser TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE
      );
      COMMIT;
    `
  },
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
  },
  {
    name: '20231101_redefine_pages_primary_key_and_add_unique_index',
    sql: `
      BEGIN TRANSACTION;

      -- Drop the existing primary key constraint on page_id
      -- The constraint name might vary, 'pages_pkey' is common for single-column PKs
      ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_pkey;

      -- Add a new 'id' column as the primary key
      ALTER TABLE pages ADD COLUMN id SERIAL PRIMARY KEY;

      -- Add a unique index on (page_id, lang) to ensure uniqueness for content
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_page_id_lang ON pages (page_id, lang);

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
