import { getPage } from '$lib/api';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const currentUser = locals.user; // Get current user for admin features
  const lang = locals.lang || 'en'; // Use the language from locals, default to 'en'
  const page = await getPage('resume', lang); // 'resume' is the page_id for the resume content

  return {
    currentUser,
    page
  };
}
