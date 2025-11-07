import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { prependOriginToRelativeUrls } from '$lib/util';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const lang = url.searchParams.get('lang') || 'en';

  const result = await query('SELECT title, content FROM articles WHERE lang = $1 AND published_at IS NOT NULL ORDER BY published_at DESC', [lang]);
  const concatenatedContent = result.rows.map(row => `## ${row.title}\n\n${row.content}`).join('\n\n---\n\n');

  if (concatenatedContent) {
    const processedContent = prependOriginToRelativeUrls(concatenatedContent);
    return new Response(processedContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });
  } else {
    return json({ message: 'No articles found' }, { status: 404 });
  }
}
