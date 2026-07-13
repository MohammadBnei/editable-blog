import { getAllContent, getContentByUrl } from '$lib/cms/content-processor.js';

export const load = async () => {
  const allContent = await getAllContent();
  const projects = allContent.filter(item => item.mainDirectory === 'portfolio');
  const intro = await getContentByUrl('/pages/portfolio');

  return {
    projects,
    intro
  };
};
