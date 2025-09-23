import { json } from '@sveltejs/kit';
import { getAuthForN8N, getLinkedInPostById } from '$lib/api';

export async function POST({ request, locals, params }) {
  const currentUser = locals.user;
  const { id } = params;
  const { publish } = await request.json();

  try {
    if (publish) {
      // Trigger N8N webhook for publishing
      const n8nWebhookUrl = `https://n8n.bnei.dev/webhook-test/32407588-b5a4-40f4-bd79-2f461a0f5764?id=${id}`;
      const n8nResponse = await fetch(n8nWebhookUrl, getAuthForN8N());

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error(`Error from N8N publish webhook for post ${id}:`, errorText);
        // Decide if you want to throw an error here or just log it and proceed with DB update
        // For now, we'll log and proceed, but a more robust solution might halt if webhook fails.
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
