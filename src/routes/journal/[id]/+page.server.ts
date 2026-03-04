import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getJournalEntry } from '$lib/journal.remote';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  if (!params.id) {
    throw redirect(302, '/journal');
  }

  const entry = await getJournalEntry(Number(params.id));
  
  return { entry };
};
