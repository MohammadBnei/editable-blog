import slugify from 'slugify';
import { SHORTCUTS } from './constants';
import { Database } from "bun:sqlite";
import { nanoid } from '$lib/util';
import { DB_PATH, ADMIN_PASSWORD } from '$env/static/private';
import { Blob } from 'node:buffer';

const db = new Database(DB_PATH, {
  // verbose: console.log
});
db.pragma('journal_mode = WAL');
db.pragma('case_sensitive_like = true');


/**
 * Creates a new article
 */
export async function createArticle(title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

    let slug = slugify(title, {
      lower: true,
      strict: true
    });

    // If slug is already used, we add a unique postfix
    const articleExists = db.query('SELECT * FROM articles WHERE slug = :slug').get({ ':slug': slug });
    if (articleExists) {
      slug = slug + '-' + nanoid();
    }

    db.run(`
        INSERT INTO articles (slug, title, content, teaser, published_at)
        VALUES(:slug, :title, :content, :teaser, DATETIME('now'))
      `,
      { ':slug': slug, ':title': title, ':content': content, ':teaser': teaser }
      );

  const newArticleQuery = "SELECT slug, created_at FROM articles WHERE slug = :slug";
  const newArticle = db.query(newArticleQuery).get({ ':slug': slug });
  return newArticle;
}

/**
 * We automatically extract a teaser text from the document's content.
 */
export async function updateArticle(slug, title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const query = `
    UPDATE articles
    SET title = :title, content = :content, teaser = :teaser, updated_at = datetime('now')
    WHERE slug = :slug
  `;
  db.run(query, { ':title': title, ':content': content, ':teaser': teaser, ':slug': slug });

  const updatedArticleQuery = "SELECT slug, updated_at FROM articles WHERE slug = :slug";
  const updatedArticle = db.query(updatedArticleQuery).get({ ':slug': slug });

  return updatedArticle;
}

/*
  This can be replaced with any user-based authentication system
*/
export async function authenticate(password, sessionTimeout) {
  const expires = __getDateTimeMinutesAfter(sessionTimeout);
  if (password === ADMIN_PASSWORD) {
    const sessionId = nanoid();

    // Now is a good time to remove expired sessions
    db.run('DELETE FROM sessions WHERE expires < :expires', { ':expires': new Date().toISOString() });

    // Create a new session
    const result = db.query('INSERT INTO sessions (session_id, expires) values(:sessionId, :expires) returning session_id').get(
      { ':sessionId': sessionId, ':expires': expires }
    );

    return { sessionId: result.session_id };
  } else {
    throw 'Authentication failed.';
  }
}

/*
  Log out of the admin session ...
*/
export async function destroySession(sessionId) {
  db.run('DELETE FROM sessions WHERE session_id = :sessionId', { ':sessionId': sessionId });
  return true;
}

/**
 * List all available articles (newest first)
 */
export async function getArticles(currentUser) {
  let articles;
  let statement;

  if (currentUser) {
    // When logged in, show both drafts and published articles
    statement = db.query(
      'SELECT *, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles ORDER BY modified_at DESC'
    );
  } else {
    statement = db.query(
      'SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC'
    );
  }

  articles = statement.all();
  return articles;
}

/**
 * Given a slug, determine article to "read next"
 */
export async function getNextArticle(slug) {
  const query = `
    WITH previous_published AS (
      SELECT
        title,
        teaser,
        slug,
        published_at
      FROM articles
      WHERE
        published_at < (SELECT published_at FROM articles WHERE slug = :currentSlug)
      ORDER BY published_at DESC
      LIMIT 1
    ),
    latest_article AS (
      SELECT
        title,
        teaser,
        slug,
        published_at
      FROM articles
      WHERE slug <> :currentSlug
      ORDER BY published_at DESC
      LIMIT 1
    )
    SELECT title, teaser, slug, published_at
    FROM (
      SELECT * FROM previous_published
      UNION
      SELECT * FROM latest_article
    )
    ORDER BY published_at ASC
    LIMIT 1;
  `;

  const result = db.query(query).get({ ':currentSlug': slug });
  return result;
}

/**
 * Search within all searchable items (including articles and website sections)
 */
export async function search(q, currentUser) {
  let query;
  if (currentUser) {
    query = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title LIKE :q COLLATE NOCASE
      ORDER BY modified_at DESC;
    `;
  } else {
    query = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title LIKE :q COLLATE NOCASE AND published_at IS NOT NULL
      ORDER BY modified_at DESC;
    `;
  }

  const results = db.query(query).all({ ':q': `%${q}%` });

  // Also include predefined shortcuts in search
  SHORTCUTS.forEach(shortcut => {
    if (shortcut.name.toLowerCase().includes(q.toLowerCase())) {
      results.push(shortcut);
    }
  });

  return results;
}

/**
 * Retrieve article based on a given slug
 */
export async function getArticleBySlug(slug) {
  const query = "SELECT * FROM articles WHERE slug = :slug";
  const article = db.query(query).get({ ':slug': slug });
  return article;
}

/**
 * Remove the entire article
 */
export async function deleteArticle(slug, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const query = "DELETE FROM articles WHERE slug = :slug";
  const result = db.run(query, { ':slug': slug });

  return result.changes > 0;
}

/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
export async function getCurrentUser(session_id) {
  const stmt = db.query(
    'SELECT session_id, expires FROM sessions WHERE session_id = :sessionId AND expires > :expires'
  );
  const session = stmt.get({ ':sessionId': session_id, ':expires': new Date().toISOString() });

  if (session) {
    return { name: 'Admin' };
  } else {
    return null;
  }
}


/**
 * Update the page
 */
export async function createOrUpdatePage(page_id, page, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  const pageExists = db.query('SELECT page_id FROM pages WHERE page_id = :pageId').get({ ':pageId': page_id });
  if (pageExists) {
    return db
      .query('UPDATE pages SET data = :data, updated_at = :updatedAt WHERE page_id = :pageId RETURNING page_id')
      .get({ ':data': JSON.stringify(page), ':updatedAt': new Date().toISOString(), ':pageId': page_id });
  } else {
    return db
      .query('INSERT INTO pages (page_id, data, updated_at) values(:pageId, :data, :updatedAt) RETURNING page_id')
      .get({ ':pageId': page_id, ':data': JSON.stringify(page), ':updatedAt': new Date().toISOString() });
  }
}

/**
 * E.g. getPage("home") gets all dynamic data for the home page
 */
export async function getPage(page_id) {
  const page = db.query('SELECT data FROM pages WHERE page_id = :pageId').get({ ':pageId': page_id });
  if (page?.data) {
    return JSON.parse(page.data);
  } else {
    return null;
  }
}

/**
 * We can count all kinds of things with this.
 */
export async function createOrUpdateCounter(counter_id) {
  return db.transaction(() => {
    // Remove recipients associated with the friend if there are any entries
    const counter_exists = db
      .query('SELECT counter_id FROM counters WHERE counter_id = :counterId')
      .get({ ':counterId': counter_id });
    if (counter_exists) {
      return db
        .query('UPDATE counters SET count = count + 1 WHERE counter_id = :counterId RETURNING count')
        .get({ ':counterId': counter_id });
    } else {
      return db
        .query('INSERT INTO counters (counter_id, count) values(:counterId, 1) RETURNING count')
        .get({ ':counterId': counter_id });
    }
  })();
}

// asset_id is a string and has the form path
export async function storeAsset(asset_id, file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sql = `
  INSERT into assets (asset_id, mime_type, updated_at, size, data) VALUES (:assetId, :mimeType, :updatedAt, :size, :data)
  ON CONFLICT (asset_id) DO
  UPDATE
     SET mime_type = excluded.mime_type,
         updated_at = excluded.updated_at,
         size = excluded.size,
         data = excluded.data
  WHERE asset_id = excluded.asset_id
  `;
  db.run(sql, { ':assetId': asset_id, ':mimeType': file.type, ':updatedAt': new Date().toISOString(), ':size': file.size, ':data': buffer });
}

export function getAsset(asset_id) {
  const sql = `
  SELECT
    asset_id,
    mime_type,
    updated_at,
    size,
    data
  FROM assets
  WHERE asset_id = :assetId
  `;

  const row = db.query(sql).get({ ':assetId': asset_id });
  return {
    filename: row.asset_id.split('/').slice(-1),
    mimeType: row.mime_type,
    lastModified: row.updated_at,
    size: row.size,
    data: new Blob([row.data], { type: row.mime_type })
  };
}

/**
 * Helpers
 */
function __getDateTimeMinutesAfter(minutes) {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
}
