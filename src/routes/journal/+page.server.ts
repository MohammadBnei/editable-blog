import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }
};
