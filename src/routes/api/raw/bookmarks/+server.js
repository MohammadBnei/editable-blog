import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

export async function GET({ url }) {
  const lang = url.searchParams.get('lang') || 'en';

  const pageResult = await query(
    `SELECT data FROM pages WHERE page_id = $1 AND lang = $2`,
    ['bookmarks', lang]
  );
  const bookmarksPage = pageResult.rows[0]?.data ? JSON.parse(pageResult.rows[0].data) : null;

  if (!bookmarksPage) {
    return json({ message: 'Bookmarks page not found' }, { status: 404 });
  }

  let markdownContent = `# ${bookmarksPage.title || 'My Bookmarks'}\n\n`;

  if (bookmarksPage.introContent) {
    markdownContent += `${bookmarksPage.introContent}\n\n`;
  }

  if (bookmarksPage.bookmarks && bookmarksPage.bookmarks.length > 0) {
    bookmarksPage.bookmarks.forEach(bookmark => {
      markdownContent += `## ${bookmark.title}\n`;
      if (bookmark.url) {
        markdownContent += `URL: [${bookmark.url}](${bookmark.url})\n`;
      }
      if (bookmark.description) {
        markdownContent += `${bookmark.description}\n`;
      }
      markdownContent += '\n';
    });
  }

  return new Response(markdownContent, {
    headers: {
      'Content-Type': 'text/markdown'
    }
  });
}
