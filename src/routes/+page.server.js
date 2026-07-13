import { getAllContent } from '$lib/cms/content-processor.js';

export const load = async () => {
  const allContent = await getAllContent();
  const posts = allContent
    .filter(item => item.directory === 'blog')
    .sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));

  return { latestPost: posts[0] ?? null };
};
