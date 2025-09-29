import { json } from '@sveltejs/kit';
import { getAuthForN8N, getLinkedInPostById } from '$lib/api';
import { env } from '$env/dynamic/private';

export async function POST({ request, locals, params }) {
  const currentUser = locals.user;
  const { id } = params;
  const { publish } = await request.json();

  try {
    if (publish) {
      // Trigger N8N webhook for publishing
      const n8nResponse = await fetch(env.N8N_LINKEDIN_POSTER + `?id=${id}`, getAuthForN8N());

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error(`Error from N8N publish webhook for post ${id}:`, errorText);

        return json({ message: errorText }, { status: n8nResponse.status });
      } else {
        console.log(`N8N publish webhook triggered successfully for post ${id}`);
      }
    }

    const updatedPost = await getLinkedInPostById(id, currentUser);
    if (!updatedPost) {
      return json({ message: 'LinkedIn Post not found or unauthorized' }, { status: 404 });
    }
    return json(updatedPost);
  } catch (error) {
    console.error(`Error setting published status for LinkedIn post ${id}:`, error);
    return json({ message: error.message }, { status: 500 });
  }
}
