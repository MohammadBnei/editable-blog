import { getContentByUrl, getAllContent } from '$lib/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const entries = async () => {
  const projects = await getAllContent();
  return projects
    .filter(item => item.directory === 'portfolio/fr')
    .map(project => ({ slug: project.slug }));
};

export const load = async ({ params }) => {
  const url = `/portfolio/fr/${params.slug}`;
  const project = await getContentByUrl(url);

  if (!project) {
    error(404, 'Project not found');
  }

  const enUrl = `/portfolio/${params.slug}`;
  const enProject = await getContentByUrl(enUrl);

  return {
    project,
    translationUrl: enProject ? enUrl : null
  };
};
