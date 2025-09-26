import { getLinkedInPostById, getNextLinkedInPost, getPreviousLinkedInPost } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }

  const linkedinPost = await getLinkedInPostById(params.id, currentUser);
  
  const [nextLinkedInPost, previousLinkedInPost] = await Promise.all([
    getNextLinkedInPost(linkedinPost.id, locals.lang),
    getPreviousLinkedInPost(linkedinPost.id, locals.lang)
  ]);

  if (!linkedinPost) {
    throw error(404, 'LinkedIn Post not found');
  }

  return {
    currentUser,
    linkedinPost,
    nextLinkedInPost,
    previousLinkedInPost
  };
}
