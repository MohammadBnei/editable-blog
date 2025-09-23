import { json } from '@sveltejs/kit';
import { updateLinkedInPost } from '$lib/api';

export async function POST({ request, locals, params }) {
  const currentUser = locals.user;
  const { id } = params;
  const { post, linkedin_url } = await request.json();

  try {
    const updatedPost = await updateLinkedInPost(parseInt(id), post, linkedin_url, currentUser);
    if (!updatedPost) {
      return json({ message: 'LinkedIn Post not found or unauthorized' }, { status: 404 });
    }
    return json(updatedPost);
  } catch (error) {
    console.error(`Error updating LinkedIn post ${id}:`, error);
    return json({ message: error.message }, { status: 500 });
  }
}
