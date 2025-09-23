import { getLinkedInPostById } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    throw error(403, 'Unauthorized');
  }

  const linkedinPost = await getLinkedInPostById(params.id, currentUser);

  if (!linkedinPost) {
    throw error(404, 'LinkedIn Post not found');
  }

  return {
    currentUser,
    linkedinPost
  };
}
