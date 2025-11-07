import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
  const { slug: projectSlug } = params;
  const lang = url.searchParams.get('lang') || 'en';

  const pageResult = await query(
    `SELECT data FROM pages WHERE page_id = $1 AND lang = $2`,
    ['portfolio', lang]
  );
  const portfolioPage = pageResult.rows[0]?.data ? JSON.parse(pageResult.rows[0].data) : null;

  if (portfolioPage && portfolioPage.projects) {
    const project = portfolioPage.projects.find(p => p.slug === projectSlug);
    if (project?.content) {
      return new Response(project.content, {
        headers: {
          'Content-Type': 'text/markdown'
        }
      });
    }
  }
  return json({ message: 'Project not found' }, { status: 404 });
}
