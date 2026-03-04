import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getJournalEntries, getJournalEntry, createJournalEntry, updateJournalEntry, deleteJournalEntry } from './journal.remote';

export const mcpServer = new McpServer({
  name: 'journal-mcp',
  version: '1.0.0'
});

mcpServer.registerTool(
  'get_journal_entries',
  'Get a list of journal entries with optional filters',
  {
    category: z.string().optional(),
    friction_score: z.number().optional(),
    limit: z.number().optional()
  },
  async (filters) => {
    const entries = await getJournalEntries(filters);
    return {
      content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }]
    };
  }
);

mcpServer.registerTool(
  'get_journal_entry',
  'Get a single journal entry by ID',
  { id: z.number() },
  async ({ id }) => {
    const entry = await getJournalEntry(id);
    return {
      content: [{ type: 'text', text: JSON.stringify(entry, null, 2) }]
    };
  }
);

mcpServer.registerTool(
  'create_journal_entry',
  'Create a new journal entry',
  {
    title: z.string().min(1),
    summary: z.string().optional(),
    friction_score: z.number().optional(),
    category: z.string().optional(),
    data: z.object({
      messages: z.array(z.object({
        type: z.enum(['question', 'answer']),
        text: z.string(),
        timestamp: z.string()
      }))
    }).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  },
  async (data) => {
    const id = await createJournalEntry(data);
    return {
      content: [{ type: 'text', text: `Created journal entry with ID: ${id}` }]
    };
  }
);

mcpServer.registerTool(
  'update_journal_entry',
  'Update an existing journal entry',
  {
    id: z.number(),
    updates: z.object({
      title: z.string().min(1).optional(),
      summary: z.string().optional(),
      friction_score: z.number().optional(),
      category: z.string().optional(),
      data: z.object({
        messages: z.array(z.object({
          type: z.enum(['question', 'answer']),
          text: z.string(),
          timestamp: z.string()
        }))
      }).optional(),
      metadata: z.record(z.string(), z.any()).optional()
    })
  },
  async ({ id, updates }) => {
    await updateJournalEntry({ id, updates });
    return {
      content: [{ type: 'text', text: `Updated journal entry ${id}` }]
    };
  }
);

mcpServer.registerTool(
  'delete_journal_entry',
  'Delete a journal entry',
  { id: z.number() },
  async ({ id }) => {
    await deleteJournalEntry(id);
    return {
      content: [{ type: 'text', text: `Deleted journal entry ${id}` }]
    };
  }
);
