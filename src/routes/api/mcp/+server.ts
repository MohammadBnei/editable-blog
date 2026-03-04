import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { mcpServer } from '$lib/mcp';
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!env.MCP_API_TOKEN || token !== env.MCP_API_TOKEN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  await mcpServer.connect(transport);

  const body = await request.json();
  const response = await transport.handleRequest(request, new Response(), body);
  
  request.signal.addEventListener('abort', () => transport.close());

  return new Response(response, {
    headers: { 'Content-Type': 'application/json' }
  });
};
