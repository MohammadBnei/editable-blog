import { getLinkedInPosts } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }

  const linkedinPosts = await getLinkedInPosts(locals.lang, currentUser);

  return {
    currentUser,
    linkedinPosts
  };
}
