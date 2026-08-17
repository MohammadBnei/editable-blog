// Shared helpers for listing blog posts: date display, sort order, text search.
//
// `gray-matter` parses unquoted YAML dates (`date: 2025-09-29`) into real JS
// `Date` objects, so metadata.date is a Date here, not a string — hence
// formatDate() rather than interpolating it directly in a template.

/** Render a frontmatter date as YYYY-MM-DD. */
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
}

/** Milliseconds since epoch; missing or unparseable dates sort as oldest. */
function time(post) {
  const ms = new Date(post.metadata?.date).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Lowercase and strip accents, so "disponibilite" matches "Disponibilité". */
function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export const SORTS = {
  newest: (a, b) => time(b) - time(a),
  oldest: (a, b) => time(a) - time(b),
  title: (a, b) => String(a.metadata?.title ?? '').localeCompare(String(b.metadata?.title ?? ''))
};

/**
 * Filter posts by a free-text query over title + description, then sort them.
 * Never mutates `posts` — filter() already returns a fresh array to sort.
 */
export function filterAndSort(posts, { query = '', sort = 'newest' } = {}) {
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
