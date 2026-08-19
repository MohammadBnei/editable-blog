import { getAllContent, getContentByUrl } from '$lib/cms/content-processor.js';
import { SORTS } from '$lib/posts.js';

export const load = async () => {
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
