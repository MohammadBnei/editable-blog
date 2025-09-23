import { getLinkedInPosts } from '$lib/api';

export async function load({ locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    // Redirect to login or show an unauthorized message
    // For now, let's return an empty array and handle in Svelte component
    return {
      currentUser: null,
      linkedinPosts: []
    };
  }

  const linkedinPosts = await getLinkedInPosts(locals.lang, currentUser);

  return {
    currentUser,
    linkedinPosts
  };
}
