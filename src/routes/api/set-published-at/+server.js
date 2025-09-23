import { json } from '@sveltejs/kit';
import { setPublishedAt } from '$lib/api';

export async function POST({ request, locals }) {
  const currentUser = locals.user;
  const { slug, publish } = await request.json();
  const row = await setPublishedAt(slug, locals.lang, publish, currentUser);
  return json({ slug, status: 'ok', ...row });
}
