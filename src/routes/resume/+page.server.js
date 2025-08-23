import { getPage } from '$lib/api';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const lang = locals.lang || 'en'; // Use the language from locals, default to 'en'
  const resumePage = await getPage('resume', lang); // 'resume' is the page_id for the resume content

  if (!resumePage || !resumePage.content) {
    // If the resume page content is not found, return a 404 error
    error(404, 'Resume content not found. Please create it in the admin panel.');
  }

  return {
    content: resumePage.content
  };
}
