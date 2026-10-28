import { getAllContent } from '$lib/cms/content-processor';
import { SORTS } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const allContent = await getAllContent();
  const posts = allContent.filter(item => item.directory === 'blog').sort(SORTS.newest);

  return { latestPost: posts[0] ?? null };
};
