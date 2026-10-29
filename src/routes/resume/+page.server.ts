import { error } from '@sveltejs/kit';
import { getContentByUrl } from '$lib/cms/content-processor';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const page = await getContentByUrl('/pages/resume');

  if (!page) {
    error(404, 'Resume not found');
  }

  return {
    page
  };
};
