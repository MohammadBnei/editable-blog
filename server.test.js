import { afterEach, describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { Glob } from 'bun';
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
    // bad %-escape, truncated UTF-8 escape, NUL byte
    for (const path of ['/%zz', '/%E0%A4%A', '/%00']) {
      const res = await get(path);
      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Security-Policy')).toBe(CSP);
    }
  });

  it('answers a path past the OS name limit with 404, not a thrown 500', async () => {
    // 1200 bytes but 400 chars: a char-count cap would let it through to fs.
    for (const path of ['/' + 'e'.repeat(5000), '/' + '%E2%82%AC'.repeat(400)]) {
      const res = await get(path);
      expect(res.status).toBe(404);
      expect(res.headers.get('Content-Security-Policy')).toBe(CSP);
    }
  });

  it('redirects a trailing slash to the slashless URL, never off-site', async () => {
    for (const [path, location] of [
      ['/blog/post/', '/blog/post'],
      ['/blog/?q=1', '/blog?q=1'],
      ['//evil.com/', '/evil.com']
    ]) {
      const res = await get(path);
      expect(res.status).toBe(308);
      expect(res.headers.get('Location')).toBe(location);
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

describe('version', () => {
  const saved = process.env.VERSION;
  afterEach(() => {
    if (saved === undefined) delete process.env.VERSION;
    else process.env.VERSION = saved;
  });
  const get = () => handle(new Request('http://localhost/version'));

  it('serves the baked-in version at /version, uncached, with the CSP header', async () => {
    process.env.VERSION = '9.9.9-test';
    const res = await get();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('9.9.9-test\n');
    expect(res.headers.get('cache-control')).toBe('no-cache');
    expect(res.headers.get('content-security-policy')).toBe(CSP);
  });

  it('says dev when VERSION is unset', async () => {
    delete process.env.VERSION; // must not inherit a developer's or CI's VERSION
    const res = await get();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('dev\n');
  });
});

// A real src attribute, not data-src (\b would match between '-' and 's').
const SRC_ATTR = /\ssrc\s*=/i;

describe('CSP', () => {
  it('header carries only frame-ancestors, never a fetch directive', () => {
    // Header and the per-page meta intersect: a header script-src, or a
    // default-src it falls back to, would block the hashed hydration script.
    expect(CSP).toContain("frame-ancestors 'none'");
    expect(CSP).not.toMatch(/-src\b/);
  });

  it('svelte.config asks kit for hash-mode CSP without unsafe-inline', async () => {
    const { csp } = (await import('./svelte.config.js')).default.kit;
    expect(csp.mode).toBe('hash');
    expect(csp.directives['script-src']).toContain('self');
    expect(JSON.stringify(csp.directives)).not.toContain('unsafe-inline');
  });

  // ponytail: build-gated; skipped on a clean checkout. The Dockerfile runs it
  // right after `bun run build`, so the image check on every PR exercises it.
  it.skipIf(!existsSync(new URL('./build', import.meta.url)))(
    'every built page hashes each inline script in its CSP meta',
    () => {
      const pages = [
        ...new Glob('build/**/*.html').scanSync({ cwd: import.meta.dir, absolute: true })
      ];
      expect(pages.length).toBeGreaterThan(0);
      for (const page of pages) {
        const html = readFileSync(page, 'utf8');
        const metas =
          html.match(/<meta http-equiv="content-security-policy" content="[^"]*"/gi) ?? [];
        expect(metas.length, page).toBe(1);
        for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
          if (SRC_ATTR.test(attrs)) continue;
          const hash = createHash('sha256').update(body).digest('base64');
          expect(metas[0], page).toContain(`'sha256-${hash}'`);
        }
      }
    }
  );

  it('app.html has no inline script or inline event handler', () => {
    const html = readFileSync(new URL('./src/app.html', import.meta.url), 'utf8');
    const tags = html.match(/<script\b[^>]*>/gi) ?? [];
    expect(tags.length).toBeGreaterThan(0); // positive control: theme-init.js is there
    for (const tag of tags) expect(tag).toMatch(SRC_ATTR);
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  });
});
