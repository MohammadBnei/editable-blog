import { json } from '@sveltejs/kit';
import { getAuthForN8N } from '$lib/api';
import { env } from '$env/dynamic/private';


export async function POST({ request, locals }) {
  const currentUser = locals.user;
  const lang = locals.lang;
  const { slug } = await request.json();

  if (!currentUser) {
    return json({ message: 'Not authorized' }, { status: 401 });
  }

  if (!slug || !lang) {
    return json({ message: 'Missing slug or language' }, { status: 400 });
  }


  try {
    const response = await fetch(env.N8N_LINKEDIN_POST_CREATOR+`?slug=${slug}&lang=${lang}`, getAuthForN8N());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from N8N webhook:', errorText);
      return json({ message: `Failed to trigger N8N webhook: ${errorText}` }, { status: response.status });
    }

    return json({ message: 'N8N webhook triggered successfully' });
  } catch (error) {
    console.error('Error triggering N8N webhook:', error);
    return json({ message: 'Internal server error when triggering N8N webhook' }, { status: 500 });
  }
}
