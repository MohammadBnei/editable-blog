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
  event.locals.lang = event.cookies.get('lang') || 'en';
  
  const response = await resolve(event);
  return response;
}
