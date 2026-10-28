import { getContentByUrl, getAllContent } from '$lib/cms/content-processor';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
  const projects = await getAllContent();
  return projects
    .filter(item => item.directory === 'portfolio/fr')
    .map(project => ({ slug: project.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
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
