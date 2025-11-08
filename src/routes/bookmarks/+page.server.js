import { getPage } from '$lib/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const currentUser = locals.user; // Get current user for admin features
  const lang = locals.lang || 'en'; // Use the language from locals, default to 'en'
  const page = await getPage('bookmarks', lang); // Static content for the bookmarks page

  return {
    currentUser,
    page
  };
}
