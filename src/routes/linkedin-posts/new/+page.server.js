import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/login');
  }

  return {
    currentUser,
    lang: locals.lang // Pass the current language to the Svelte component
  };
}
