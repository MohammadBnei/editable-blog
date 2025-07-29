// src/routes/[lang]/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ params, cookies }) {
  const lang = params.lang; // Get the language from the URL parameter (e.g., 'fr', 'en')

  // Validate the language parameter
  if (lang && ['en', 'fr'].includes(lang)) {
    cookies.set('lang', lang, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 365 });
    throw redirect(302, '/'); // Redirect to the root page
  } else {
    // If the language parameter is invalid, redirect to the default language or a 404 page
    // For now, let's redirect to the default English root page.
    throw redirect(302, '/');
  }
}
