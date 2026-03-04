import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { mcpServer } from '$lib/mcp';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  await mcpServer.connect(transport);

  const body = await request.json();
  const response = await transport.handleRequest(request, undefined, body);
  
  request.signal.addEventListener('abort', () => transport.close());

  return new Response(response, {
    headers: { 'Content-Type': 'application/json' }
  });
};
