// ponytail: hand-rolled static file server replaces `serve` — zero deps,
// matches serve's default clean-URL behavior (exact file -> +'.html' -> 404.html).
import { resolve, sep } from 'node:path';

const BUILD_DIR = resolve(import.meta.dir, 'build');
const NOT_FOUND_FILE = resolve(BUILD_DIR, '404.html');
// Baked into the image by the Dockerfile's VERSION build-arg; dev anywhere else.
// Read per call, so a test can set it without a fresh process.
const version = () => process.env.VERSION || 'dev';

// Malformed input (bad %-escape, NUL byte, traversal) is the client's fault:
// null here becomes a 400, not a thrown 500.
function resolveSafePath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
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
// add a fetch directive (script-src, default-src, any *-src) here: header and
// meta policies intersect, so it would block that hashed inline script.
export const CSP = "frame-ancestors 'none'";

async function tryFile(path, pathname) {
  let file;
  try {
    file = Bun.file(path);
  } catch (err) {
    // A path past the OS limit (PATH_MAX is 1024 on macOS, in bytes, with
    // the build/ prefix) cannot name a file: a miss, not a 500.
    if (err?.code === 'ENAMETOOLONG') return null;
    throw err;
  }
  return (await file.exists())
    ? new Response(file, { headers: { 'Cache-Control': cacheControl(pathname) } })
    : null;
}

// Every response, whatever branch built it, carries the CSP header.
export async function handle(req) {
  const res = await route(req);
  res.headers.set('Content-Security-Policy', CSP);
  return res;
}

async function route(req) {
  const { pathname, search } = new URL(req.url);
  // Not /version.json: build/_app/version.json is SvelteKit's build timestamp.
  if (pathname === '/version') {
    return new Response(`${version()}\n`, {
      headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  // Pages use relative asset URLs (`../theme-init.js`), so `/blog/x/` served
  // as blog/x.html would resolve them one directory too deep. Redirect to the
  // canonical slashless URL. Leading slashes collapse to one, so `//evil.com/`
  // cannot become a protocol-relative Location.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const location = '/' + pathname.replace(/^\/+|\/+$/g, '') + search;
    return new Response(null, { status: 308, headers: { Location: location } });
  }
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

  console.log(`serving ${BUILD_DIR} on :3000, version ${version()}`);
}
