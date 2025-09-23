import { json } from '@sveltejs/kit';
import { setLinkedInPostPublishedAt } from '$lib/api';

export async function POST({ request, locals, params }) {
  const currentUser = locals.user;
  const { id } = params;
  const { publish } = await request.json();

  try {
    const updatedPost = await setLinkedInPostPublishedAt(parseInt(id), publish, currentUser);
    if (!updatedPost) {
      return json({ message: 'LinkedIn Post not found or unauthorized' }, { status: 404 });
    }
    return json(updatedPost);
  } catch (error) {
    console.error(`Error setting published status for LinkedIn post ${id}:`, error);
    return json({ message: error.message }, { status: 500 });
  }
}
