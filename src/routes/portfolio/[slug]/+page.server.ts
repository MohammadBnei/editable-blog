import { getContentByUrl, getAllContent } from '$lib/cms/content-processor';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
  const projects = await getAllContent();
  // `directory`, not `mainDirectory`: the latter is 'portfolio' for
  // content/portfolio/fr/** too, which would prerender every French
  // project a second time under the English route.
  return projects
    .filter(item => item.directory === 'portfolio')
    .map(project => ({ slug: project.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const url = `/portfolio/${params.slug}`;
  const project = await getContentByUrl(url);

  if (!project) {
    error(404, 'Project not found');
  }

  const frUrl = `/portfolio/fr/${params.slug}`;
  const frProject = await getContentByUrl(frUrl);

  return {
    project,
    translationUrl: frProject ? frUrl : null
  };
};
