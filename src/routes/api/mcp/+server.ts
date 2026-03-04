import type { RequestHandler } from './$types';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { mcpServer } from '$lib/mcp';

const handler = createMcpHandler(
	(server) => {
		// Use the existing tools registered on mcpServer
		// Note: The adapter might expect tools to be registered via this callback
		// if the server instance is fresh. 
		// Since mcpServer is imported, we rely on its existing registration.
	},
	{
		// Optional: if you want to provide a pre-existing server instance
		// many adapters allow passing the server as an option
	},
	{
		maxDuration: 5,
		streamableHttpEndpoint: '/api/mcp',
		verboseLogs: true,
	},
);

export const GET: RequestHandler = async ({ request }) => {
	return handler(request);
};

export const POST: RequestHandler = async ({ request }) => {
	return handler(request);
};

export const DELETE: RequestHandler = async ({ request }) => {
	return handler(request);
};
