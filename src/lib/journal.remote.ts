import { query, command, form } from '$app/server';
import { query as dbQuery } from './db';
import { z } from 'zod';
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

const JournalDataSchema = z.object({
  messages: z.array(
    z.object({
      type: z.enum(['question', 'answer']),
      text: z.string(),
      timestamp: z.string()
    })
  )
});

const JournalSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  friction_score: z.number().optional(),
  category: z.string().optional(),
  data: JournalDataSchema.default({ messages: [] }),
  metadata: z.record(z.string(), z.any()).default({})
});

export const getJournalEntries = query(
  z.object({
    category: z.string().optional(),
    friction_score: z.number().optional()
  }).default({}),
  async (filters) => {
    let sql = 'SELECT * FROM journal';
    const where: string[] = [];
    const params: any[] = [];

    if (filters.category) {
      params.push(filters.category);
      where.push(`category = $${params.length}`);
    }

    if (filters.friction_score !== undefined) {
      params.push(filters.friction_score);
      where.push(`friction_score = $${params.length}`);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await dbQuery(sql, params);
    return result.rows as JournalEntry[];
  }
);

export const getJournalEntry = query(z.number(), async (id) => {
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
  z.object({
    id: z.number(),
    updates: JournalSchema.partial()
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

export const deleteJournalEntry = command(z.number(), async (id) => {
  const result = await dbQuery('DELETE FROM journal WHERE id = $1', [id]);
  if (result.rowCount === 0) error(404, 'Journal entry not found');
  return { success: true };
});
