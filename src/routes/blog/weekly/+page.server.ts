import { getAllContent } from '$lib/cms/content-processor';
import { SORTS } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const allContent = await getAllContent();

  return {
    rundowns: allContent.filter(item => item.directory === 'blog/weekly').sort(SORTS.newest)
  };
};
