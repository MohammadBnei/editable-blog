import { json } from '@sveltejs/kit';
import cheerio from 'cheerio';

export async function GET({ url }) {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content') || $('meta[name="twitter:url"]').attr('content') || targetUrl,
    };

    // Clean up metadata - remove undefined or null values
    Object.keys(metadata).forEach(key => metadata[key] === undefined && delete metadata[key]);

    return json(metadata);
  } catch (error) {
    console.error(`Error fetching or parsing metadata for ${targetUrl}:`, error);
    return json({ error: 'Internal server error while fetching metadata' }, { status: 500 });
  }
}
