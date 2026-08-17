import { describe, expect, test } from 'bun:test';
import { filterAndSort, formatDate, SORTS } from './posts.js';

const post = (title, date, description = '') => ({
  url: `/blog/${title}`,
  metadata: { title, date, description }
});

const a = post('Alpha', new Date('2025-01-01'));
const b = post('Beta', new Date('2026-08-18'));
const c = post('Charlie', new Date('2025-09-29'), 'Haute Disponibilité et résilience');
const undated = post('Draft', null);

const titles = posts => posts.map(p => p.metadata.title);

describe('formatDate', () => {
  test('renders a Date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2025-09-29'))).toBe('2025-09-29');
  });

  test('renders a date string as YYYY-MM-DD', () => {
    expect(formatDate('2025-09-29')).toBe('2025-09-29');
  });

  test('returns empty string for missing dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  test('passes unparseable values through untouched', () => {
    expect(formatDate('someday')).toBe('someday');
  });
});

describe('sorting', () => {
  test('newest first by default', () => {
    expect(titles(filterAndSort([a, b, c]))).toEqual(['Beta', 'Charlie', 'Alpha']);
  });

  test('oldest first', () => {
    expect(titles(filterAndSort([a, b, c], { sort: 'oldest' }))).toEqual([
      'Alpha',
      'Charlie',
      'Beta'
    ]);
  });

  test('by title', () => {
    expect(titles(filterAndSort([c, b, a], { sort: 'title' }))).toEqual([
      'Alpha',
      'Beta',
      'Charlie'
    ]);
  });

  test('unknown sort key falls back to newest', () => {
    expect(titles(filterAndSort([a, b], { sort: 'nope' }))).toEqual(['Beta', 'Alpha']);
  });

  test('undated posts sort last (newest) without corrupting order', () => {
    expect(titles(filterAndSort([a, undated, b]))).toEqual(['Beta', 'Alpha', 'Draft']);
    expect(SORTS.newest(undated, undated)).toBe(0);
  });

  test('does not mutate the input array', () => {
    const input = [a, b];
    filterAndSort(input, { sort: 'oldest' });
    expect(input).toEqual([a, b]);
  });
});

describe('search', () => {
  test('empty query keeps everything', () => {
    expect(filterAndSort([a, b, c], { query: '   ' })).toHaveLength(3);
  });

  test('matches title case-insensitively', () => {
    expect(titles(filterAndSort([a, b, c], { query: 'beta' }))).toEqual(['Beta']);
  });

  test('matches description', () => {
    expect(titles(filterAndSort([a, b, c], { query: 'resilience' }))).toEqual(['Charlie']);
  });

  test('matches accented text typed without accents', () => {
    expect(titles(filterAndSort([a, b, c], { query: 'disponibilite' }))).toEqual(['Charlie']);
  });

  test('no match yields an empty list', () => {
    expect(filterAndSort([a, b, c], { query: 'kubernetes' })).toEqual([]);
  });
});
