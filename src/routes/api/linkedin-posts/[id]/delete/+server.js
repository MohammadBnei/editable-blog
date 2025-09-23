import { json } from '@sveltejs/kit';
import { deleteLinkedInPost } from '$lib/api';

export async function POST({ locals, params }) {
  const currentUser = locals.user;
  const { id } = params;

  try {
    const success = await deleteLinkedInPost(parseInt(id), currentUser);
    if (!success) {
      return json({ message: 'LinkedIn Post not found or unauthorized' }, { status: 404 });
    }
    return json({ message: 'LinkedIn Post deleted successfully' });
  } catch (error) {
    console.error(`Error deleting LinkedIn post ${id}:`, error);
    return json({ message: error.message }, { status: 500 });
  }
}
