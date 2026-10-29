# editable-blog

Tier: static. An adapter-static SvelteKit site plus `server.js`, a zero-dependency Bun file server.
Scope: static core plus TS (owner, 2026-10-28).

Change loop (ukubi Code Standard, A4): full loop for security, auth, wire, data or schema changes and
behaviour-unchanged claims; light loop (plan, local checks, review) for CI, docs, pins, static content
and isolated fixes. See the shared `ukubi-standard` plugin (`change-loop`, `repo-rules`) and the standard; not copied here.

## Commands

```bash
bun install     # install deps
bun run dev     # dev server (vite)
bun run build   # svelte-check (TS + checkJs, fails on any error/warning), then prerenders
                # the whole site to build/, then generates
                # sitemap.xml/robots.txt/rss.xml (postbuild)
bun run preview # serve build/ locally with server.js, same as production
bun run test    # bun's built-in test runner over every *.test.{js,ts}
bun run lint    # biome ci (lint + format check + import order)
bun run format  # biome format --write (no git hook runs it; lint checks it)
```

There is no database and no admin login in this repo. Tests exist only for
code with logic worth breaking (`src/lib/posts.ts`,
`src/lib/cms/content-processor.ts`, `server.js`, plus `pins.test.js` for exact
dependency pins, and `src/ts-only.test.ts`, which fails on any `.js`/`.jsx`/`.mjs`/`.cjs` under `src/`), and they run on Bun's built-in runner — no vitest, no
playwright, no test framework dependency. Components and routes are not tested.

## Commits and checks

Conventional Commit subjects and PR titles; `content(<area>): ...` is also allowed for
posts. Agent commits end with both `Co-Authored-By: ukubi-claude-<host>|cloud
<noreply@bnei.dev>` and `Agent-Session: <id>`, or with neither. No claude.ai URLs, no
`Claude-Session:` line, no "Generated with" footer, in commits or PR bodies. This repo's
rule wins over any global or harness attribution instruction. `.github/workflows/trailers.yml`
enforces it on every PR, and `checks.yml` (lint, test, build, image build) gates both PRs
and the release on main.

## Architecture

Fully static site originally scaffolded from [statue-ssg](https://github.com/accretional/statue)
via `bunx statue init`, but statue-ssg is no longer a dependency at all —
`src/lib/cms/content-processor.ts` is a one-time vendored copy, trimmed to
the two functions this site actually uses (`getAllContent`,
`getContentByUrl`), imported directly as `$lib/cms/content-processor`
(no alias indirection). It also exports the typed content record
(`ContentEntry`, `ContentMetadata`, `QaTurn`): a new frontmatter field a page
reads goes into `ContentMetadata` first, or the typecheck fails. The vendored `src/lib/themes` CSS files were
likewise replaced entirely by daisyUI theme tokens, see `DESIGN.md`.
SvelteKit's `@sveltejs/adapter-static`
prerenders every route at build time (`prerender: { crawl: true }` in
`svelte.config.js`, `export const prerender = true` in the root layout) —
there is no server-side rendering at runtime, no database, and no admin
editing UI. Publishing content means committing a markdown file.

**Content model**: markdown files under `content/`, read at build time via
`$lib/cms/content-processor` (`getAllContent`, `getContentByUrl`).
A file's route comes from its path: `content/<dir>/<slug>.md` → `/<dir>/<slug>`,
frontmatter (YAML, via `gray-matter`) becomes `metadata`, and the markdown
body is rendered to `content` HTML. `scripts/generate-rss-feed.js` imports
the same vendored file directly by a relative path ending in `.ts` (it runs as a plain Bun
script in `postbuild`, outside Vite, so SvelteKit's `$lib` alias doesn't
apply there). `postbuild` runs every script with `bun`, never `node`, and a
failed content-processor import fails the build instead of dropping `rss.xml`.

- `content/blog/<slug>.md` — English posts, listed at `/blog`
  (`src/routes/blog/+page.server.ts` filters to `directory === 'blog'`).
- `content/blog/fr/<slug>.md` — French posts, served at `/blog/fr/<slug>`
  via a dedicated `src/routes/blog/fr/[slug]/` route (SvelteKit's
  `[slug]` routing can't match multi-segment paths, so this isn't the same
  route as the English one). There is no `/blog/fr` index page yet.
- `content/portfolio/<slug>.md` — projects, listed at `/portfolio`
  (frontmatter: `title`, `gitLink`, `liveLink`).
- `content/pages/{resume,portfolio}.md` — single-page content (resume body,
  portfolio intro text), loaded by slug via `getContentByUrl('/pages/<slug>')`.
- Private content (LinkedIn drafts, retro transcripts) lives in hq
  (`hq/linkedin/`, `hq/notes/retros/`), not here. This site serves only
  public content.

Each content-backed route follows the same shape: `+page.server.ts` calls
`getAllContent`/`getContentByUrl`/`entries()` from the content-processor,
`+page.svelte` renders `{@html post.content}` inside a `prose` block. Adding
a new content type means copying that pattern (see `src/routes/blog/[slug]/`
or `src/routes/portfolio/[slug]/`), not inventing a new content-loading
mechanism.

**TypeScript**: everything under `src/` is TypeScript — `.ts` modules and
`<script lang="ts">` in every `.svelte` file. No `.js`/`.jsx`/`.mjs`/`.cjs` under
`src/`, dot-directories included (`src/ts-only.test.ts` fails on one: Vite resolves an extensionless
import to `.js` first and Bun to `.ts` first, so a stray twin would split the
site build from the tests) and no bare `<script>` (Biome has no
`svelte/block-lang` equivalent, so nothing lints this now). Imports inside `src/` drop the extension. Routes type
`load`/`entries` and props through `./$types`. Root config files, `server.js`
and `scripts/` stay JS, checked by `checkJs`. `strict` is off.

**Listing posts**: `$lib/posts.ts` holds the shared helpers — `formatDate`,
the `SORTS` comparators, and `filterAndSort`. Reuse them instead of inlining
another date sort. `formatDate` exists because `gray-matter`'s YAML loader
turns an unquoted `date: 2025-09-29` into a real JS `Date`, which stringifies
in a template as `Mon Sep 29 2025 00:00:00 GMT+0000 (…)` — never interpolate
`metadata.date` directly. Because `adapter-static` prerenders everything and
there is no server at runtime, the default sort happens in `+page.server.ts`
(so the HTML is correct with JS disabled) while the sort control and search
box on `/blog` are client-side `$derived` over the data already shipped.

**i18n**: UI/navigation is English-only (no lang cookie, no language
switcher). Only blog posts are bilingual, via the `content/blog/fr/`
directory convention above.

**Health check**: `static/healthz` is a plain static file (not a SvelteKit
route) — SvelteKit copies `static/` verbatim into `build/`, so it's served as
a real `200 ok` response by whatever serves `build/`. k8s's liveness/readiness
probes hit it directly.

**Deployment**: `Dockerfile` builds with `bun run build` (produces a fully
static `build/` directory) and serves it with `server.js`, a small
zero-dependency Bun static file server (replaced the `serve` npm package —
resolves a request to an exact file in `build/`, then `<path>.html` for
clean route URLs, then `404.html`; logs one JSON line
(`{level, message, time}`) via `Bun.serve`'s `error` hook only when a
request actually throws, no per-request access logging; malformed paths
— bad `%`, NUL, traversal — get a 400, a path too long for the OS a 404,
never a throw; `X/` 308-redirects to `X`, since pages use relative asset URLs). CSP is
split: SvelteKit `kit.csp` (`mode: 'hash'`) writes a per-page `<meta>` with
`script-src 'self'` plus that page's hydration-script hash; `server.js` adds
a `frame-ancestors 'none'` header (a meta can't carry it). Never put
`script-src`, `default-src` or any `*-src` in the header — header and meta
intersect, so it would block hydration. No inline `<script>` in `src/app.html`: the pre-paint theme
bootstrap is `static/theme-init.js`. Don't add
SPA/index.html fallback behavior for unrecognized paths: that previously
broke `/healthz` when using `serve -s`, since it silently served
`index.html` instead of the real health check file.

**Release and deploy**: a push to `main` runs `.github/workflows/release.yml`:
`checks.yml` (lint, test, build, image build), then ukubi-ci's `release.yml`
(git-cliff over the Conventional Commits since the last tag) commits
`chore(release): X.Y.Z` with its `CHANGELOG.md` section and tags it.
The bump comes from the squash-merge commit subject (the PR title): `feat` or a
breaking change minor (while 0.x), anything else patch. Then
`build-push` runs `buildah` on the self-hosted `ukubi-build` runner, tags the
image with the built commit's 12-char sha (the release commit, unless main
moved past it), passes the version as the
`VERSION` build-arg (`X.Y.Z+<sha>` when the commit is untagged) and pushes to
`registry.bnei.lan:5000/editable-blog` (registry password from Infisical
over OIDC), then `deploy` sets `image.tag` in `helm/values.yaml` with `yq`
and commits `chore(deploy): bump editable-blog image to <sha>` to `main`.
The running version is on the start log line and at `GET /version` (plain
text, `dev` outside the image). There is no version in `package.json`; the
last tag is the version. If main moved past the gated commit with only
`paths-ignore`'d files, the release waits for the next push: release now with
`gh workflow run release.yml --ref main`. Argo CD renders `helm/values.yaml` from `main`
through infra-bootstrap's `common-app-chart`; the Application comes from
the generator in `gitops/bootstrap/apps.applicationset.yaml`, mirrored in
`gitops/apps/registry.yaml`. A push whose every changed file is a root
`*.md`, any `*.yml`/`*.yaml`, or `package.json` cuts no release
(`paths-ignore`); content posts under `content/` do. The pod reads no
secrets: there is no Infisical block in the values.

**Everything from the previous Postgres/n8n/admin-editor architecture is
gone**: no `pg`, no `src/hooks.server.ts`, no `/login`, no journal/
LinkedIn-posts/bookmark/view-counter features. If you're looking for how
those used to work, check git history before this pivot, not this file.
