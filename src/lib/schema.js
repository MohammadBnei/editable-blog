export const schema = `
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
  data BYTEA NOT NULL -- Changed BLOB to BYTEA for PostgreSQL
);

CREATE TABLE IF NOT EXISTS articles (
  article_id SERIAL PRIMARY KEY, -- Changed INTEGER PRIMARY KEY to SERIAL PRIMARY KEY for auto-increment
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Changed DATETIME to TIMESTAMP WITH TIME ZONE
  published_at TIMESTAMP WITH TIME ZONE, -- Changed DATETIME to TIMESTAMP WITH TIME ZONE
  updated_at TIMESTAMP WITH TIME ZONE, -- Changed DATETIME to TIMESTAMP WITH TIME ZONE
  lang TEXT DEFAULT 'en' NOT NULL,
  UNIQUE (slug, lang)
);
COMMIT;
`;
