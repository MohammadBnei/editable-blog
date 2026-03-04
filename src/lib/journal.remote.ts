import { query, command } from '$app/server';
import { z } from 'zod';
import * as service from './journal.service';
import { JournalSchema, JournalDataSchema } from './journal.service';

export const getJournalEntries = query(
  z.object({
    category: z.string().optional(),
    friction_score: z.number().optional(),
    limit: z.number().optional()
  }).default({}),
  service.getJournalEntries
);

export const getJournalEntry = query(z.number(), service.getJournalEntry);

export const createJournalEntry = command(JournalSchema, service.createJournalEntry);

export const updateJournalEntry = command(
  z.object({
    id: z.number(),
    updates: JournalSchema.partial()
  }),
  async ({ id, updates }) => service.updateJournalEntry(id, updates)
);

export const deleteJournalEntry = command(z.object({ id: z.number() }), async ({ id }) =>
  service.deleteJournalEntry(id)
);

export const addJournalExchanges = command(
  z.object({
    id: z.number(),
    messages: z.array(JournalDataSchema.shape.messages.element).min(1)
  }),
  async ({ id, messages }) => service.addJournalExchanges(id, messages)
);
