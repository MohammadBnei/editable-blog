// Drift guard for the exact pins (ukubi Code Standard: exact Bun, exact deps).
// CI reads the Bun version from packageManager; nothing else ties the Dockerfile to it.
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = f => readFileSync(join(import.meta.dir, f), 'utf-8');
const pkg = JSON.parse(read('package.json'));
const dockerfile = read('Dockerfile');

test('packageManager is an exact bun version', () => {
  expect(pkg.packageManager).toMatch(/^bun@\d+\.\d+\.\d+$/);
});

test('every dependency is an exact version', () => {
  const specs = { ...pkg.dependencies, ...pkg.devDependencies };
  const loose = Object.entries(specs).filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v));
  expect(loose).toEqual([]);
});

test('Dockerfile BUN_IMAGE is the packageManager version, pinned by digest', () => {
  const version = pkg.packageManager.replace('bun@', '').replaceAll('.', '\\.');
  const arg = new RegExp(
    `^ARG BUN_IMAGE=docker\\.io/oven/bun:${version}-alpine@sha256:[0-9a-f]{64}$`,
    'm'
  );
  expect(dockerfile).toMatch(arg);
});

test('every Dockerfile stage is built FROM ${BUN_IMAGE}', () => {
  const froms = dockerfile.match(/^FROM .*$/gim) ?? [];
  expect(froms.length).toBeGreaterThan(0);
  expect(froms.filter(l => !/^FROM \$\{BUN_IMAGE\}( AS \w+)?$/.test(l))).toEqual([]);
});

test('the runner stage carries VERSION as an OCI label and env', () => {
  const runner = dockerfile.split(/^FROM \$\{BUN_IMAGE\} AS runner$/m)[1] ?? '';
  for (const line of [
    'ARG VERSION',
    'LABEL org.opencontainers.image.version=${VERSION:-dev}',
    'ENV VERSION=${VERSION:-dev}'
  ])
    expect(runner.split('\n')).toContain(line);
});
