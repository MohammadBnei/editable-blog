import { getCurrentUser } from '$lib/api';
import { migrate } from './lib/db';

let migrated = false;

export async function handle({ event, resolve }) {
  if (!migrated) {
    migrate().catch(err => {
      console.error('Failed to run database migrations on startup:', err);
      // Depending on your application's needs, you might want to exit here
      process.exit(1);
    });
    migrated = true;
  }
  event.locals.user = await getCurrentUser(event.cookies.get('sessionid'));

  // Determine language:
  // 1. From cookie
  let lang = event.cookies.get('lang');
  if (!lang) {
    // 2. From Accept-Language header
    const acceptLanguageHeader = event.request.headers.get('accept-language');
    lang = acceptLanguageHeader ? acceptLanguageHeader.split(',')[0].split('-')[0] : 'en';
    // 3. Fallback to 'en' if header is not useful
    if (!['en', 'fr'].includes(lang)) lang = 'en'; // Only support 'en' and 'fr' for now
    event.cookies.set('lang', lang, { path: '/' }); // Set the cookie for future requests
  }
  event.locals.lang = lang;
  
  const response = await resolve(event);
  return response;
}
