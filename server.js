// ponytail: hand-rolled static file server replaces `serve` — zero deps,
// matches serve's default clean-URL behavior (exact file -> +'.html' -> 404.html).
import { resolve, sep } from 'node:path';

const BUILD_DIR = resolve(import.meta.dir, 'build');
const NOT_FOUND_FILE = resolve(BUILD_DIR, '404.html');

function resolveSafePath(pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
  const candidate = resolve(BUILD_DIR, relative);
  if (candidate !== BUILD_DIR && !candidate.startsWith(BUILD_DIR + sep)) {
    return null;
  }
  return candidate;
}

// Hashed build assets are safe to cache forever — the filename changes when
// the content does. Everything else (HTML routes, /healthz, static files)
// must revalidate, or a deploy leaves clients holding an index page that
// points at chunk filenames the server no longer has. That failure mode is
// silent: a dynamic import 404s and the feature it lazy-loads just never
// appears.
export function cacheControl(pathname) {
  return pathname.startsWith('/_app/immutable/')
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
}

async function tryFile(path, pathname) {
  const file = Bun.file(path);
  return (await file.exists())
    ? new Response(file, { headers: { 'Cache-Control': cacheControl(pathname) } })
    : null;
}

if (import.meta.main) {
  Bun.serve({
    port: 3000,
    async fetch(req) {
      const { pathname } = new URL(req.url);
      const target = resolveSafePath(pathname);
      if (!target) return new Response('Bad Request', { status: 400 });

      let res = await tryFile(target, pathname);
      if (res) return res;

      if (!target.endsWith('.html')) {
        res = await tryFile(`${target}.html`, pathname);
        if (res) return res;
      }

      return new Response(Bun.file(NOT_FOUND_FILE), {
        status: 404,
        headers: { 'Cache-Control': 'no-cache' }
      });
    },
    error(err) {
      console.error(
        JSON.stringify({
          level: 'error',
          message: err instanceof Error ? err.message : String(err),
          time: new Date().toISOString()
        })
      );
      return new Response('Internal Server Error', { status: 500 });
    }
  });

  console.log(`serving ${BUILD_DIR} on :3000`);
}
