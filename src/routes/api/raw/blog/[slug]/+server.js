import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
  const { slug } = params;
  const lang = url.searchParams.get('lang') || 'en';

  const result = await query('SELECT content FROM articles WHERE slug = $1 AND lang = $2', [slug, lang]);
  const content = result.rows[0]?.content || null;

  if (content) {
    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown'
      }
    });
  } else {
    return json({ message: 'Article not found' }, { status: 404 });
  }
}
