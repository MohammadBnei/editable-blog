// ponytail: hand-rolled static file server replaces `serve` — zero deps,
// matches serve's default clean-URL behavior (exact file -> +'.html' -> 404.html).
import { resolve, sep } from 'node:path';

const BUILD_DIR = resolve(import.meta.dir, 'build');
const NOT_FOUND_FILE = resolve(BUILD_DIR, '404.html');

// The longest real path in build/ is under 100 chars; past ~1024 the OS
// throws ENAMETOOLONG, which would surface as a 500 + error log.
const MAX_PATH = 1024;

// Malformed input (bad %-escape, NUL byte, absurd length, traversal) is the
// client's fault: null here becomes a 400, not a thrown 500.
function resolveSafePath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.length > MAX_PATH) return null;
  const relative = decoded.replace(/^\/+/, '') || 'index.html';
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

// Only what a <meta> CSP cannot carry. script-src lives in each page's
// SvelteKit-generated meta (kit.csp, hashes of its hydration script). Never
// add script-src here: header and meta policies intersect, so a header
// `script-src 'self'` would block that hashed inline script.
export const CSP = "frame-ancestors 'none'";

async function tryFile(path, pathname) {
  const file = Bun.file(path);
  return (await file.exists())
    ? new Response(file, {
        headers: { 'Cache-Control': cacheControl(pathname), 'Content-Security-Policy': CSP }
      })
    : null;
}

export async function handle(req) {
  const { pathname } = new URL(req.url);
  const target = resolveSafePath(pathname);
  if (!target) {
    return new Response('Bad Request', {
      status: 400,
      headers: { 'Content-Security-Policy': CSP }
    });
  }

  let res = await tryFile(target, pathname);
  if (res) return res;

  if (!target.endsWith('.html')) {
    res = await tryFile(`${target}.html`, pathname);
    if (res) return res;
  }

  return new Response(Bun.file(NOT_FOUND_FILE), {
    status: 404,
    headers: { 'Cache-Control': 'no-cache', 'Content-Security-Policy': CSP }
  });
}

if (import.meta.main) {
  Bun.serve({
    port: 3000,
    fetch: handle,
    error(err) {
      console.error(
        JSON.stringify({
          level: 'error',
          message: err instanceof Error ? err.message : String(err),
          time: new Date().toISOString()
        })
      );
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Security-Policy': CSP }
      });
    }
  });

  console.log(`serving ${BUILD_DIR} on :3000`);
}
