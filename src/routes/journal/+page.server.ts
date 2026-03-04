import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getJournalEntries } from '$lib/journal.remote';

export const load: PageServerLoad = async ({ locals }) => {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }

  return {
    entries: await getJournalEntries({ limit: 10 })
  };
};
