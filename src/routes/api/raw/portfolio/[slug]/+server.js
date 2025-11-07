import { json } from '@sveltejs/kit';
import { query } from '$lib/db';
import { env } from '$env/dynamic/private';

/**
 * Helper function to prepend ORIGIN to relative URLs in markdown.
 * @param {string} markdownContent
 * @returns {string}
 */
function prependOriginToRelativeUrls(markdownContent) {
  const origin = env.ORIGIN || ''; // Get ORIGIN from environment variables
  if (!origin) return markdownContent;

  // Regex to find markdown links and images: [text](url) or ![alt](url)
  // It captures the URL part.
  return markdownContent.replace(/(\]\()(\/[^)]+)(\))/g, (match, p1, p2, p3) => {
    // p1 is '](', p2 is the relative path, p3 is ')'
    return `${p1}${origin}${p2}${p3}`;
  });
}

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
      const processedContent = prependOriginToRelativeUrls(project.content);
      return new Response(processedContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8'
        }
      });
    }
  }
  return json({ message: 'Project not found' }, { status: 404 });
}
