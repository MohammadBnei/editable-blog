/**
 * Retrieve all projects (newest first)
 */
export async function getProjects(lang = 'en') {
  const result = await query('SELECT * FROM projects WHERE lang = $1 ORDER BY created_at DESC', [lang]);
  return result.rows;
}
