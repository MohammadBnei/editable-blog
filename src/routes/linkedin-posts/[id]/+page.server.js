import { getLinkedInPostById, getNextLinkedInPost, getPreviousLinkedInPost } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }

  const linkedinPost = await getLinkedInPostById(params.id, currentUser);

  if (!linkedinPost) {
    throw error(404, 'LinkedIn Post not found');
  }

  // Fetch next and previous LinkedIn posts based on the current post's created_at and lang
  const nextLinkedInPost = await getNextLinkedInPost(linkedinPost.id, locals.lang);
  const previousLinkedInPost = await getPreviousLinkedInPost(linkedinPost.id, locals.lang);

  return {
    currentUser,
    linkedinPost,
    nextLinkedInPost,
    previousLinkedInPost
  };
}
