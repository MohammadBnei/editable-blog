import slugify from 'slugify';
import { SHORTCUTS } from './constants';
import { env } from '$env/dynamic/private';
import { query } from '$lib/db'; // Import the PostgreSQL query function
import { nanoid } from '$lib/util';
import { Blob } from 'node:buffer';
// Removed readFile as schema initialization will be external for PostgreSQL

// Removed SQLite-specific PRAGMA and schema execution

/**
 * Creates a new article
 */
export async function createArticle(title, content, teaser, currentUser, lang = 'en') {
  if (!currentUser) throw new Error('Not authorized');

  let slug = slugify(title, {
    lower: true,
    strict: true
  });

  // If (slug, lang) is already used, we add a unique postfix to the slug
  const articleExistsResult = await query('SELECT * FROM articles WHERE slug = $1 AND lang = $2', [slug, lang]);
  if (articleExistsResult.rows.length > 0) {
    slug = slug + '-' + nanoid();
  }

  const insertResult = await query(
    `
    INSERT INTO articles (slug, title, content, teaser, published_at, lang)
    VALUES($1, $2, $3, $4, NOW(), $5)
    RETURNING slug, created_at, lang
    `,
    [slug, title, content, teaser, lang]
  );

  const newArticle = insertResult.rows[0];

  // Trigger webhook if URL is provided
  if (env.N8N_WEBHOOK_URL && newArticle.slug) {
    try {
      // Trigger webhook for language detection
      const langWebhookUrl = `${env.N8N_WEBHOOK_URL}?getLang=true&slug=${newArticle.slug}`;
      const langFetchOptions = {};

      const auth = Buffer.from(`${env.N8N_USERNAME}:${env.N8N_PASSWORD}`).toString('base64');
      langFetchOptions.headers = {
        'Authorization': `Basic ${auth}`
      };
      
      const langResponse = await fetch(langWebhookUrl, langFetchOptions);
      if (langResponse.ok) {
        const { lang: detectedLang } = await langResponse.json();
        if (detectedLang && detectedLang !== newArticle.lang) { // Only update if different from initial 'en'
          await query('UPDATE articles SET lang = $1 WHERE slug = $2', [detectedLang, newArticle.slug]);
        }
      } else {
        console.error('Failed to get language from webhook:', langResponse.status, langResponse.statusText);
      }

      // Original webhook trigger (if needed for other purposes)
      const webhookUrl = `${env.N8N_WEBHOOK_URL}?slug=${newArticle.slug}`;
      await fetch(webhookUrl, langFetchOptions); // Re-using langFetchOptions as it contains auth
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  }

  return newArticle;
}

/**
 * We automatically extract a teaser text from the document's content.
 */
export async function updateArticle(slug, lang, title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  getArticleBySlug(slug, lang).then(oldArticle => {
    // Asset cleanup logic
    if (!oldArticle) return;

    const imgRegex = /<img src="\/assets\/(images\/[^"]+)"/g;
    const oldAssetIds = new Set();
    const newAssetIds = new Set();
    let match;

    // Extract asset IDs from old content
    while ((match = imgRegex.exec(oldArticle.content)) !== null) {
      oldAssetIds.add(match[1]);
    }
    // Reset regex lastIndex for new content scan
    imgRegex.lastIndex = 0;

    // Extract asset IDs from new content
    while ((match = imgRegex.exec(content)) !== null) {
      newAssetIds.add(match[1]);
    }

    // Identify assets to delete (present in old, not in new)
    const assetsToDelete = [...oldAssetIds].filter(assetId => !newAssetIds.has(assetId));

    for (const assetId of assetsToDelete) {
      deleteAsset(assetId);
    }
  });

  const updateResult = await query(
    `
    UPDATE articles SET title = $1, content = $2, teaser = $3, updated_at = NOW() WHERE slug = $4 AND lang = $5 RETURNING slug, updated_at
    `,
    [title, content, teaser, slug, lang] // Added lang to WHERE clause
  );

  return updateResult.rows[0];
}

/*
  This can be replaced with any user-based authentication system
*/
export async function authenticate(password, sessionTimeout) {
  const expires = __getDateTimeMinutesAfter(sessionTimeout);
  if (password === env.ADMIN_PASSWORD) {
    const sessionId = nanoid();

    // Now is a good time to remove expired sessions
    await query('DELETE FROM sessions WHERE expires < $1', [new Date().toISOString()]);

    // Create a new session
    const insertResult = await query(
      'INSERT INTO sessions (session_id, expires) values($1, $2) RETURNING session_id',
      [sessionId, expires]
    );

    return { sessionId: insertResult.rows[0].session_id };
  } else {
    throw 'Authentication failed.';
  }
}

/*
  Log out of the admin session ...
*/
export async function destroySession(sessionId) {
  const deleteResult = await query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
  return deleteResult.rowCount > 0;
}

/**
 * List all available articles (newest first)
 */
export async function getArticles(currentUser) {
  let articlesResult;

  if (currentUser) {
    // When logged in, show both drafts and published articles, ordered by modified_at and then lang
    articlesResult = await query(
      'SELECT *, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles ORDER BY modified_at DESC, lang ASC'
    );
  } else {
    // When not logged in, show only published articles, ordered by published_at and then lang
    articlesResult = await query(
      'SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC, lang ASC'
    );
  }
  
  return articlesResult.rows;
}

/**
 * Given a slug, determine article to "read next"
 */
export async function getNextArticle(slug, lang) {
  const queryText = `
    WITH previous_published AS (
      SELECT
        title,
        teaser,
        slug,
        published_at
      FROM articles
      WHERE lang = $2 AND
        published_at < (SELECT published_at FROM articles WHERE slug = $1 AND lang = $2)
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
      WHERE slug <> $1 AND lang = $2
      ORDER BY published_at DESC
      LIMIT 1
    )
    SELECT title, teaser, slug, published_at
    FROM (
      SELECT * FROM previous_published
      UNION
      SELECT * FROM latest_article
    ) AS combined_articles
    ORDER BY published_at ASC
    LIMIT 1;
  `;
  // Pass both slug and lang to the query
  const result = await query(queryText, [slug, lang]);
  return result.rows[0];
}

/**
 * Search within all searchable items (including articles and website sections)
 */
export async function search(q, currentUser) {
  let queryText;
  if (currentUser) {
    queryText = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title ILIKE $1
      ORDER BY modified_at DESC;
    `;
  } else {
    queryText = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title ILIKE $1 AND published_at IS NOT NULL
      ORDER BY modified_at DESC;
    `;
  }

  const results = await query(queryText, [`%${q}%`]);

  // Also include predefined shortcuts in search
  SHORTCUTS.forEach(shortcut => {
    if (shortcut.name.toLowerCase().includes(q.toLowerCase())) {
      results.rows.push(shortcut);
    }
  });

  return results.rows;
}

/**
 * Retrieve article based on a given slug
 */
export async function getArticleBySlug(slug, lang = 'en') {
  const result = await query('SELECT * FROM articles WHERE slug = $1 AND lang = $2', [slug, lang]);
  return result.rows[0];
}

/**
 * Remove the entire article
 */
export async function deleteArticle(slug, lang, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  if (!lang) throw new Error('Missing lang');

  const article = await getArticleBySlug(slug, lang);
  if (!article) throw new Error('Article not found');
    
  // Extract asset IDs from the article content and delete them
  const imgRegex = /<img src="\/assets\/(images\/[^"]+)"/g;
  let match;
  const assetIdsToDelete = [];
  
  while ((match = imgRegex.exec(article.content)) !== null) {
    assetIdsToDelete.push(match[1]);
  }
  
  // Delete assets in a separate promise
  Promise.all(assetIdsToDelete.map(assetId => deleteAsset(assetId))).catch(error => {
    console.error('Error deleting assets during article deletion:', error);
  });

  const deleteResult = await query('DELETE FROM articles WHERE slug = $1 AND lang = $2', [slug, lang]);

  return deleteResult.rowCount > 0;
}

/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
export async function getCurrentUser(session_id) {
  const result = await query(
    'SELECT session_id, expires FROM sessions WHERE session_id = $1 AND expires > $2',
    [session_id, new Date().toISOString()]
  );
  const session = result.rows[0];

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

  const pageExistsResult = await query('SELECT page_id FROM pages WHERE page_id = $1', [page_id]);
  if (pageExistsResult.rows.length > 0) {
    const updateResult = await query(
      'UPDATE pages SET data = $1, updated_at = NOW() WHERE page_id = $2 RETURNING page_id',
      [JSON.stringify(page), page_id]
    );
    return updateResult.rows[0];
  } else {
    const insertResult = await query(
      'INSERT INTO pages (page_id, data, updated_at) values($1, $2, NOW()) RETURNING page_id',
      [page_id, JSON.stringify(page)]
    );
    return insertResult.rows[0];
  }
}

/**
 * E.g. getPage("home") gets all dynamic data for the home page
 */
export async function getPage(page_id) {
  const result = await query('SELECT data FROM pages WHERE page_id = $1', [page_id]);
  const page = result.rows[0];
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
  // PostgreSQL transactions require a client from the pool
  // For simple single queries, the `query` function handles it,
  // but for a sequence of operations that need to be atomic,
  // you'd typically get a client and use it for the transaction.
  // For this specific case, we can use ON CONFLICT.

  const upsertResult = await query(
    `
    INSERT INTO counters (counter_id, count) VALUES ($1, 1)
    ON CONFLICT (counter_id) DO UPDATE SET count = counters.count + 1
    RETURNING count
    `,
    [counter_id]
  );
  return upsertResult.rows[0];
}

// asset_id is a string and has the form path
export async function storeAsset(asset_id, file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sql = `
  INSERT INTO assets (asset_id, mime_type, updated_at, size, data) VALUES ($1, $2, NOW(), $3, $4)
  ON CONFLICT (asset_id) DO UPDATE
     SET mime_type = EXCLUDED.mime_type,
         updated_at = NOW(),
         size = EXCLUDED.size,
         data = EXCLUDED.data
  RETURNING asset_id
  `;
  await query(sql, [asset_id, file.type, file.size, buffer]);
}

export async function getAsset(asset_id) {
  const sql = `
  SELECT
    asset_id,
    mime_type,
    updated_at,
    size,
    data
  FROM assets
  WHERE asset_id = $1
  `;

  const result = await query(sql, [asset_id]);
  const row = result.rows[0];

  if (!row) {
    return null; // Asset not found
  }

  return {
    filename: row.asset_id.split('/').pop(), // Use pop() to get the last element
    mimeType: row.mime_type,
    lastModified: row.updated_at,
    size: row.size,
    data: new Blob([row.data], { type: row.mime_type })
  };
}

/**
 * Remove an asset by its ID.
 */
export async function deleteAsset(asset_id) {
  const deleteResult = await query('DELETE FROM assets WHERE asset_id = $1', [asset_id]);
  return deleteResult.rowCount > 0;
}

/**
 * Helpers
 */
function __getDateTimeMinutesAfter(minutes) {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
}
