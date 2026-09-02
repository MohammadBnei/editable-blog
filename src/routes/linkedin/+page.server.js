import { getAllContent } from '$lib/cms/content-processor.js';
import { SORTS } from '$lib/posts.js';

export const load = async () => {
  const allContent = await getAllContent();

  return {
    posts: allContent.filter(item => item.directory === 'linkedin').sort(SORTS.newest)
  };
};
