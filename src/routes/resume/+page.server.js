import { getContentByUrl } from 'statue-ssg/cms/content-processor.js';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const page = await getContentByUrl('/pages/resume');

  if (!page) {
    error(404, 'Resume not found');
  }

  return {
    page
  };
};
