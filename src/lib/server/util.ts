import { env } from '$env/dynamic/private';

/**
 * Helper function to prepend ORIGIN to relative URLs in markdown.
 * @param {string} markdownContent
 * @returns {string}
 */
export function prependOriginToRelativeUrls(markdownContent: string): string {
  const origin = env.ORIGIN || ''; // Get ORIGIN from environment variables
  if (!origin) return markdownContent;

  // Regex to find markdown links and images: [text](url) or ![alt](url)
  // It captures the URL part.
  return markdownContent.replace(/(\]\()(\/[^)]+)(\))/g, (match, p1, p2, p3) => {
    // p1 is '](', p2 is the relative path, p3 is ')'
    return `${p1}${origin}${p2}${p3}`;
  });
}
