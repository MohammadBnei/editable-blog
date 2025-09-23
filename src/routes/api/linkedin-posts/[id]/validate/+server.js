import { json } from '@sveltejs/kit';
import { setLinkedInPostValidation } from '$lib/api';

export async function POST({ request, locals, params }) {
  const currentUser = locals.user;
  const { id } = params;
  const { validated } = await request.json();

  try {
    const updatedPost = await setLinkedInPostValidation(parseInt(id), validated, currentUser);
    if (!updatedPost) {
      return json({ message: 'LinkedIn Post not found or unauthorized' }, { status: 404 });
    }
    return json(updatedPost);
  } catch (error) {
    console.error(`Error setting validation status for LinkedIn post ${id}:`, error);
    return json({ message: error.message }, { status: 500 });
  }
}
