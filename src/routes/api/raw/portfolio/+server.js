import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { prependOriginToRelativeUrls } from '$lib/server/util';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const lang = url.searchParams.get('lang') || 'en';

  const pageResult = await query(
    `SELECT data FROM pages WHERE page_id = $1 AND lang = $2`,
    ['portfolio', lang]
  );
  const portfolioPage = pageResult.rows[0]?.data ? JSON.parse(pageResult.rows[0].data) : null;

  if (portfolioPage && portfolioPage.projects && portfolioPage.projects.length > 0) {
    const concatenatedContent = portfolioPage.projects
      .map(project => `## ${project.title}\n\n${project.content}`)
      .join('\n\n---\n\n');

    const processedContent = prependOriginToRelativeUrls(concatenatedContent);

    return new Response(processedContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });
  } else {
    return json({ message: 'No portfolio projects found' }, { status: 404 });
  }
}
