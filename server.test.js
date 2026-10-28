import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { CSP, cacheControl, handle } from './server.js';

describe('cacheControl', () => {
  it('caches hashed build assets forever', () => {
    expect(cacheControl('/_app/immutable/chunks/2oNfe2gC.js')).toBe(
      'public, max-age=31536000, immutable'
    );
  });

  it('revalidates everything a deploy can change under the same URL', () => {
    // An HTML route cached without revalidation is the whole bug: it keeps
    // pointing at chunk filenames a later deploy deleted.
    for (const path of ['/', '/blog/some-post', '/healthz', '/rss.xml']) {
      expect(cacheControl(path)).toBe('no-cache');
    }
  });
});

describe('handle', () => {
  const get = path => handle(new Request(`http://localhost${path}`));

  it('answers malformed paths with 400, not a thrown 500', async () => {
    // bad %-escape, truncated UTF-8 escape, NUL byte, longer than PATH_MAX
    for (const path of ['/%zz', '/%E0%A4%A', '/%00', '/' + 'e'.repeat(5000)]) {
      const res = await get(path);
      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Security-Policy')).toBe(CSP);
    }
  });

  it('still resolves a valid encoded path (positive control)', async () => {
    // No build/ needed: a miss falls through to the 404 branch.
    const res = await get('/caf%C3%A9');
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Security-Policy')).toBe(CSP);
  });
});

describe('CSP', () => {
  it('header carries only frame-ancestors, never script-src', () => {
    // Header and the per-page meta intersect: a header script-src would
    // block the hashed SvelteKit hydration script.
    expect(CSP).toContain("frame-ancestors 'none'");
    expect(CSP).not.toContain('script-src');
  });

  it('kit hashes inline scripts into a per-page meta', async () => {
    const { csp } = (await import('./svelte.config.js')).default.kit;
    expect(csp.mode).toBe('hash');
    expect(csp.directives['script-src']).toContain('self');
    expect(JSON.stringify(csp.directives)).not.toContain('unsafe-inline');
  });

  it('app.html has no inline script or inline event handler', () => {
    const html = readFileSync(new URL('./src/app.html', import.meta.url), 'utf8');
    const tags = html.match(/<script\b[^>]*>/gi) ?? [];
    expect(tags.length).toBeGreaterThan(0); // positive control: theme-init.js is there
    for (const tag of tags) expect(tag).toMatch(/\bsrc=/i);
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  });
});
