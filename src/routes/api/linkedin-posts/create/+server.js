import { json } from '@sveltejs/kit';
import { createLinkedInPost } from '$lib/api';

export async function POST({ request, locals }) {
  const currentUser = locals.user;
  const { article_slug, lang, post } = await request.json();

  try {
    const newPost = await createLinkedInPost(article_slug, lang, post, currentUser);
    return json(newPost);
  } catch (error) {
    console.error('Error creating LinkedIn post:', error);
    return json({ message: error.message }, { status: 500 });
  }
}
