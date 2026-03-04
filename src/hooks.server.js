import { getCurrentUser } from '$lib/api';
import { migrate } from './lib/db';
import type { Handle } from '@sveltejs/kit';
import { eventHandler, readBody } from 'h3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = new McpServer({ name: 'sveltekit-mcp', version: '1.0.0' });

const mcpHandler = eventHandler(async (event) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  event.node.res.on('close', () => transport.close());
  await server.connect(transport);
  const body = await readBody(event);
  await transport.handleRequest(event.node.req, event.node.res, body);
});

let migrated = false;

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === '/api/mcp') {
    return mcpHandler(event.nativeEvent);
  }
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
  // 1. From query parameter
  let lang = event.url.searchParams.get('lang');
  if (!lang) {
    // 2. From cookie
    lang = event.cookies.get('lang');
  }
  if (!lang) {
    // 3. From Accept-Language header
    const acceptLanguageHeader = event.request.headers.get('accept-language');
    lang = acceptLanguageHeader ? acceptLanguageHeader.split(',')[0].split('-')[0] : 'en';
  }
  // 4. Fallback to 'en' if header is not useful or no other source
  if (!['en', 'fr'].includes(lang)) lang = 'en'; // Only support 'en' and 'fr' for now

  // Always set the cookie to reflect the determined language for future requests
  event.cookies.set('lang', lang, { path: '/' });

  event.locals.lang = lang;

  const response = await resolve(event);
  return response;
}
