import { json } from '@sveltejs/kit';

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

  const n8nWebhookUrl = `https://n8n.bnei.dev/webhook-test/311465fb-1b41-45f3-8473-20f9e61f132e?slug=${slug}&lang=${lang}`;

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'GET', // N8N webhook expects a GET request for this specific URL
    });

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
