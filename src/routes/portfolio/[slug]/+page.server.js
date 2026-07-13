import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const all = await getAllContent();
  return all.filter(item => item.mainDirectory === 'portfolio').map(item => ({ slug: item.slug }));
};

export const load = async ({ params }) => {
  const url = `/portfolio/${params.slug}`;
  const project = await getContentByUrl(url);

  if (!project) {
    error(404, 'Project not found');
  }

  return {
    project
  };
};
