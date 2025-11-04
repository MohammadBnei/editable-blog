import { getPage } from '$lib/api';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const { slug } = params;
  const lang = locals.lang || 'en';
  const currentUser = locals.user;

  // Fetch the main portfolio page to find the specific project
  const portfolioPage = await getPage('portfolio', lang);

  if (!portfolioPage || !portfolioPage.projects) {
    error(404, 'Portfolio not found');
  }

  const project = portfolioPage.projects.find(p => p.slug === slug);

  if (!project) {
    error(404, 'Project not found');
  }

  return {
    project,
    currentUser,
    portfolioPage // Pass the entire portfolioPage for saving updates
  };
}
