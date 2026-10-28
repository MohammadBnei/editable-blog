import { expect, test } from 'bun:test';

// src/ is TypeScript only. A stray .js next to its .ts twin is worse than untidy: Vite
// resolves an extensionless import to .js first, Bun to .ts first, so the site build and
// the RSS script / tests would silently read different code. This test is the only guard.
const scan = (pattern: string) => [...new Bun.Glob(pattern).scanSync({ cwd: import.meta.dir })];

test('src/ holds no .js, .mjs or .cjs files', () => {
  expect(scan('**/*.{js,mjs,cjs}')).toEqual([]);
});

test('the scan sees src/ (positive control)', () => {
  expect(scan('**/*.ts')).toContain('lib/posts.ts');
});
