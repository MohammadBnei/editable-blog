import { query, command, form } from '$app/server';
import { query as dbQuery } from './db';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

export interface JournalMessage {
  type: 'question' | 'answer';
  text: string;
  timestamp: string;
}

export interface JournalData {
  messages: JournalMessage[];
}

export interface JournalEntry {
  id: number;
  title: string;
  summary: string | null;
  friction_score: number | null;
  category: string | null;
  data: JournalData;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const JournalDataSchema = v.object({
  messages: v.array(
    v.object({
      type: v.picklist(['question', 'answer']),
      text: v.string(),
      timestamp: v.string()
    })
  )
});

const JournalSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  summary: v.optional(v.string()),
  friction_score: v.optional(v.number()),
  category: v.optional(v.string()),
  data: v.optional(JournalDataSchema, { messages: [] }),
  metadata: v.optional(v.record(v.string(), v.any()), {})
});

export const getJournalEntries = query(async () => {
  const result = await dbQuery(
    'SELECT * FROM journal ORDER BY created_at DESC',
    []
  );
  return result.rows as JournalEntry[];
});

export const getJournalEntry = query(v.number(), async (id) => {
  const result = await dbQuery('SELECT * FROM journal WHERE id = $1', [id]);
  if (result.rows.length === 0) error(404, 'Journal entry not found');
  return result.rows[0] as JournalEntry;
});

export const createJournalEntry = command(JournalSchema, async (data) => {
  const result = await dbQuery(
    `INSERT INTO journal (title, summary, friction_score, category, data, metadata)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [data.title, data.summary, data.friction_score, data.category, data.data, data.metadata]
  );
  return result.rows[0].id as number;
});

export const updateJournalEntry = command(
  v.object({
    id: v.number(),
    updates: v.partial(JournalSchema)
  }),
  async ({ id, updates }) => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);

    const result = await dbQuery(
      `UPDATE journal SET ${setClause} WHERE id = $1 RETURNING id`,
      [id, ...values]
    );

    if (result.rowCount === 0) error(404, 'Journal entry not found');
  }
);

export const deleteJournalEntry = command(v.number(), async (id) => {
  const result = await dbQuery('DELETE FROM journal WHERE id = $1', [id]);
  if (result.rowCount === 0) error(404, 'Journal entry not found');
  return { success: true };
});
