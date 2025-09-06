import { getPage } from '$lib/api';
import { getProjects } from '$lib/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const currentUser = locals.user; // Get current user for admin features
  const lang = locals.lang || 'en'; // Use the language from locals, default to 'en'
  const page = await getPage('portfolio', lang); // Static content for the portfolio page
  const projects = await getProjects(lang); // Fetch the list of projects

  return {
    currentUser,
    page,
    projects
  };
}
