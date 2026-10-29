import { getAllContent, getContentByUrl } from '$lib/cms/content-processor';
import { SORTS } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const allContent = await getAllContent();

  // `directory`, not `mainDirectory`: the latter is 'portfolio' for
  // content/portfolio/fr/** too, which would list every project twice.
  const projects = allContent.filter(item => item.directory === 'portfolio').sort(SORTS.newest);
  const frProjects = allContent
    .filter(item => item.directory === 'portfolio/fr')
    .sort(SORTS.newest);

  return {
    projects,
    frProjects,
    intro: await getContentByUrl('/pages/portfolio'),
    frIntro: await getContentByUrl('/pages/fr/portfolio')
  };
};
