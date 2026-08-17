# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install     # install deps
bun run dev     # dev server (vite)
bun run build   # prerenders the whole site to build/, then generates
                # sitemap.xml/robots.txt/rss.xml (postbuild)
bun run preview # serve build/ locally with server.js, same as production
bun run test    # bun's built-in test runner over src/**/*.test.js
bun run lint    # prettier --check + eslint
bun run format  # prettier --write (also runs as husky pre-commit hook)
bun run release # release-it (bumps version, writes CHANGELOG.md)
```

There is no database and no admin login in this repo. Tests exist only for the
handful of pure helpers that have logic worth breaking (currently
`src/lib/posts.js`), and they run on Bun's built-in runner — no vitest, no
playwright, no test framework dependency. Components and routes are not tested.

## Architecture

Fully static site originally scaffolded from [statue-ssg](https://github.com/accretional/statue)
via `bunx statue init`, but statue-ssg is no longer a dependency at all —
`src/lib/cms/content-processor.js` is a one-time vendored copy, trimmed to
the two functions this site actually uses (`getAllContent`,
`getContentByUrl`), imported directly as `$lib/cms/content-processor.js`
(no alias indirection). The vendored `src/lib/themes` CSS files were
likewise replaced entirely by daisyUI theme tokens, see `DESIGN.md`.
SvelteKit's `@sveltejs/adapter-static`
prerenders every route at build time (`prerender: { crawl: true }` in
`svelte.config.js`, `export const prerender = true` in the root layout) —
there is no server-side rendering at runtime, no database, and no admin
editing UI. Publishing content means committing a markdown file.

**Content model**: markdown files under `content/`, read at build time via
`$lib/cms/content-processor.js` (`getAllContent`, `getContentByUrl`).
A file's route comes from its path: `content/<dir>/<slug>.md` → `/<dir>/<slug>`,
frontmatter (YAML, via `gray-matter`) becomes `metadata`, and the markdown
body is rendered to `content` HTML. `scripts/generate-rss-feed.js` imports
the same vendored file directly by relative path (it runs as a plain Node
script in `postbuild`, outside Vite, so SvelteKit's `$lib` alias doesn't
apply there).

- `content/blog/<slug>.md` — English posts, listed at `/blog`
  (`src/routes/blog/+page.server.js` filters to `directory === 'blog'`).
- `content/blog/fr/<slug>.md` — French posts, served at `/blog/fr/<slug>`
  via a dedicated `src/routes/blog/fr/[slug]/` route (SvelteKit's
  `[slug]` routing can't match multi-segment paths, so this isn't the same
  route as the English one). There is no `/blog/fr` index page yet.
- `content/portfolio/<slug>.md` — projects, listed at `/portfolio`
  (frontmatter: `title`, `gitLink`, `liveLink`).
- `content/pages/{resume,portfolio}.md` — single-page content (resume body,
  portfolio intro text), loaded by slug via `getContentByUrl('/pages/<slug>')`.

Each content-backed route follows the same shape: `+page.server.js` calls
`getAllContent`/`getContentByUrl`/`entries()` from the content-processor,
`+page.svelte` renders `{@html post.content}` inside a `prose` block. Adding
a new content type means copying that pattern (see `src/routes/blog/[slug]/`
or `src/routes/portfolio/[slug]/`), not inventing a new content-loading
mechanism.

**Listing posts**: `$lib/posts.js` holds the shared helpers — `formatDate`,
the `SORTS` comparators, and `filterAndSort`. Reuse them instead of inlining
another date sort. `formatDate` exists because `gray-matter`'s YAML loader
turns an unquoted `date: 2025-09-29` into a real JS `Date`, which stringifies
in a template as `Mon Sep 29 2025 00:00:00 GMT+0000 (…)` — never interpolate
`metadata.date` directly. Because `adapter-static` prerenders everything and
there is no server at runtime, the default sort happens in `+page.server.js`
(so the HTML is correct with JS disabled) while the sort control and search
box on `/blog` are client-side `$derived` over the data already shipped.

**i18n**: UI/navigation is English-only (no lang cookie, no language
switcher). Only blog posts are bilingual, via the `content/blog/fr/`
directory convention above.

**Health check**: `static/healthz` is a plain static file (not a SvelteKit
route) — statue copies `static/` verbatim into `build/`, so it's served as
a real `200 ok` response by whatever serves `build/`. k8s's liveness/readiness
probes hit it directly.

**Deployment**: `Dockerfile` builds with `bun run build` (produces a fully
static `build/` directory) and serves it with `server.js`, a small
zero-dependency Bun static file server (replaced the `serve` npm package —
resolves a request to an exact file in `build/`, then `<path>.html` for
clean route URLs, then `404.html`; logs one JSON line
(`{level, message, time}`) via `Bun.serve`'s `error` hook only when a
request actually throws, no per-request access logging). Don't add
SPA/index.html fallback behavior for unrecognized paths: that previously
broke `/healthz` when using `serve -s`, since it silently served
`index.html` instead of the real health check file. GitHub Actions
(`.github/workflows/docker.yml`,
`release.yml`) → Kustomize image bump (`k8s/`) → Argo CD sync, unchanged
from before this pivot; nothing content-related happens in CI beyond the
Docker build.

**Everything from the previous Postgres/n8n/admin-editor architecture is
gone**: no `pg`, no `src/hooks.server.ts`, no `/login`, no journal/
LinkedIn-posts/bookmark/view-counter features. If you're looking for how
those used to work, check git history before this pivot, not this file.
