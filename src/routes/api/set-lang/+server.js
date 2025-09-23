// src/routes/api/set-lang/+server.js
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  const { lang } = await request.json();

  if (lang && ['en', 'fr'].includes(lang)) {
    cookies.set('lang', lang, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365
    });
    return json({ success: true });
  } else {
    return json({ success: false, message: 'Invalid language' }, { status: 400 });
  }
}
