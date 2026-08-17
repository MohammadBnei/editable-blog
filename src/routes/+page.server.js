import { getAllContent } from '$lib/cms/content-processor.js';
import { SORTS } from '$lib/posts.js';

export const load = async () => {
  const allContent = await getAllContent();
  const posts = allContent.filter(item => item.directory === 'blog').sort(SORTS.newest);

  return { latestPost: posts[0] ?? null };
};
