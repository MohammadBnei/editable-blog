import { describe, expect, it } from 'bun:test';
import { cacheControl } from './server.js';

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
