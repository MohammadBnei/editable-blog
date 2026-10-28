// Shared helpers for listing blog posts: date display, sort order, text search.
//
// `gray-matter` parses unquoted YAML dates (`date: 2025-09-29`) into real JS
// `Date` objects, so metadata.date is a Date here, not a string — hence
// formatDate() rather than interpolating it directly in a template.

/** The fields these helpers read. ContentEntry fits, and so do the tests' bare fixtures. */
interface Listable {
  metadata?: { title?: unknown; date?: unknown; description?: unknown };
}

/** Render a frontmatter date as YYYY-MM-DD. */
export function formatDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
}

/** Milliseconds since epoch; missing or unparseable dates sort as oldest. */
function time(post: Listable): number {
  const ms = new Date(post.metadata?.date as string | number | Date).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Lowercase and strip accents, so "disponibilite" matches "Disponibilité". */
function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export const SORTS = {
  newest: (a: Listable, b: Listable) => time(b) - time(a),
  oldest: (a: Listable, b: Listable) => time(a) - time(b),
  title: (a: Listable, b: Listable) =>
    String(a.metadata?.title ?? '').localeCompare(String(b.metadata?.title ?? ''))
};

/**
 * Filter posts by a free-text query over title + description, then sort them.
 * Never mutates `posts` — filter() already returns a fresh array to sort.
 */
export function filterAndSort<T extends Listable>(
  posts: T[],
  // `sort` is a plain string, not keyof SORTS: an unknown key falls back to newest.
  { query = '', sort = 'newest' }: { query?: string; sort?: string } = {}
): T[] {
  const needle = normalize(query).trim();
  return posts
    .filter(
      post =>
        !needle ||
        normalize(`${post.metadata?.title ?? ''} ${post.metadata?.description ?? ''}`).includes(
          needle
        )
    )
    .sort(SORTS[sort] ?? SORTS.newest);
}
