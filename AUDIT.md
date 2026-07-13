# Audit: dropping in-app editing for a git + markdown CMS

## Context

The blog currently lets an admin edit content live in the browser (inline
textareas, a password-gated session, saves going straight to Postgres). The
goal is to replace that with a "simple git + markdown" model: content lives
as files in the repo, authored normally and shipped via commits, with no
runtime admin UI or database-backed editing. This document is a full audit
of what exists today, scoped to that goal — findings and risk flags only, no
migration plan (see `CMS-SKETCH.md` for the target shape, also not a
migration plan).

This is a single-developer SvelteKit 5 (runes) + PostgreSQL 16 monolith
(raw `pg` client, no ORM), running on Bun (`svelte-adapter-bun`), deployed
as a Docker image to Kubernetes via Kustomize/GitHub Actions/Argo CD. DB
schema lives in `src/lib/migrations.js` and auto-applies on first request
(`src/hooks.server.ts`). See `CLAUDE.md` for the full architecture map.

## Content inventory — fit for git+markdown

| Content type                              | Storage today                                                                                                                                                                                                                                                                   | Fit for git+markdown                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Articles** (blog posts)                 | `articles` table: slug, title, teaser, `content` (already markdown text), lang, timestamps. `src/lib/api.js`, routes under `src/routes/blog/`                                                                                                                                   | **Easy.** Already markdown. Maps directly to one `.md` file per slug+lang with frontmatter for title/teaser/dates.                                                                                                                                                                                                                                                                                                           |
| **Pages** (home, portfolio, resume, etc.) | `pages` table: `page_id`, `lang`, `data` = flat JSON blob (20+ string fields like `title`, `pillar1`, `pillar2`...). `src/lib/api.js`                                                                                                                                           | **Medium.** No markdown body, just key/value strings — maps to a YAML/JSON data file per page+lang rather than a markdown file. Field set is undocumented/implicit (whatever the template happens to read).                                                                                                                                                                                                                  |
| **Journal entries**                       | `journal` table: title, summary, `friction_score`, `category`, `data` (JSONB array of Q&A messages), `metadata` (JSONB, arbitrary keys incl. arrays). Clean service layer: `src/lib/journal.service.ts` + `src/lib/journal.remote.ts` (Zod-validated).                          | **Medium-hard.** Structurally the most complex content type — nested Q&A array plus open-ended metadata bag. Frontmatter can hold `metadata`/`category`/`friction_score`; the Q&A array is awkward as markdown prose and is probably cleaner kept as a JSON/YAML field. No fixed schema exists today (JSONB), so "what fields are actually in use" needs enumerating from real data before designing a file format.          |
| **Assets** (images, PDFs)                 | `assets` table: `asset_id` (path-like string), `mime_type`, `data BYTEA`, `size`. Served by `src/routes/assets/[...path]/+server.js`, uploaded via `src/routes/api/upload-asset`. Referenced as hardcoded `<img src="/assets/images/...">` inside article/page content.         | **Easy-medium.** Binary-in-DB → files-in-repo (or repo + static host) is a mechanical move; git handles binaries fine at this scale but has no dedup/versioning benefit for images. Reference URLs in existing content would need to keep resolving the same way (or a rewrite pass).                                                                                                                                        |
| **LinkedIn posts**                        | `linkedin_posts` table, FK to `articles(slug, lang)`. Two n8n webhooks: `N8N_LINKEDIN_POST_CREATOR` (post generation, triggered manually per-article) and `N8N_TRANSLATION_WEBHOOK_URL` (fires on article create/update to auto-translate). Admin-only UI at `/linkedin-posts`. | **Hard — automation-dependent, not just storage.** This isn't really "editable content," it's a webhook-driven side effect of saving an article (translation trigger) and a small workflow tool (LinkedIn post drafting/validation). A git-based CMS has no "on save" hook to fire these unless something (a git hook, a CI job, a small remaining service) replaces the role Postgres writes currently play as the trigger. |
| **View counters**                         | `counters` table: path string → integer, incremented on every page load via `Footer.svelte` → `GET /api/counter`. Per-route, not per-article.                                                                                                                                   | **Out of scope for "content."** Inherently mutable/live data — cannot live in git. Needs to either stay as a tiny separate DB/KV, move to a third-party analytics tool, or be dropped.                                                                                                                                                                                                                                       |
| **Sessions / auth**                       | `sessions` table, `ADMIN_PASSWORD`-gated cookie login (`src/routes/login`), checked in `src/hooks.server.ts` on every request, gates all `/edit`, `/new`, `/linkedin-posts` routes.                                                                                             | **Goes away with the editor.** Its only consumer is gating the in-app editing UI. If editing moves to git, there is no remaining reason to keep login/sessions at all (unless something else still needs auth, e.g. the LinkedIn admin tool).                                                                                                                                                                                |

## Editing/admin subsystem — what gets deleted

- **UI components**: `PlainText.svelte`, `RichText.svelte` (markdown
  textarea + `svelte-streamdown` preview), `PlainTextEditor.svelte`,
  `EditorToolbar`/`EditorControls`, `isEditing` store (`src/lib/stores.js`).
- **Save endpoints**: `/api/update-article`, `/api/save-page`,
  `/api/upload-asset`, all auth-checked (`if (!currentUser) throw ...`).
- **Confirmed dead code, independent of any CMS decision**:
  `src/lib/editor/prosemirror*.js` and `src/lib/components/tools/*.svelte`
  implement a full ProseMirror rich editor, wired into `WebsiteHeader.svelte`
  — but they depend on the `activeEditorView` store, and nothing in the
  codebase ever writes to that store. The whole path is unreachable; it was
  superseded by the plain-textarea `RichText`/`PlainText` approach but never
  removed. Correction to an earlier pass of this audit: `sortablejs` is
  _not_ dead — it's actively used for drag-and-drop reordering in
  `src/routes/bookmark/+page.svelte`, which is a separate feature from
  content editing and out of scope here.
- **No tests exist** for any of articles/pages/journal/editing — a rewrite
  has no regression safety net from the current codebase.

## Cross-cutting risks / open questions

1. **i18n**: exactly two languages (`en`/`fr`), keyed by a `lang` column +
   cookie (`src/hooks.server.ts`, `/api/set-lang`). No fallback if a
   translation is missing — the route load just returns nothing. A
   file-based scheme needs an equivalent lang-keyed lookup (e.g.
   `content/en/...` vs `content/fr/...`) and the same "missing translation"
   behavior decided explicitly.
2. **Migrations run at request time**: `hooks.server.ts` calls `migrate()`
   on first request and blocks startup on it — this pattern (and the whole
   `src/lib/migrations.js` schema-as-JS-strings approach) is presumably
   deleted wholesale if Postgres is dropped for content, but note **whatever
   remains** (counters? sessions if kept for LinkedIn tooling?) still needs
   _some_ migration story.
3. **Deploy coupling**: CI (`.github/workflows/docker.yml`, `release.yml`)
   builds a Docker image and updates a Kustomize image tag — no explicit DB
   migration step in CI today (it happens implicitly on pod startup). Moving
   content into the repo means every content edit becomes a
   rebuild+redeploy, which is a workflow change (slower publish loop) worth
   being aware of, not just a code change.
4. **Journal has no fixed schema** — `data`/`metadata` are JSONB grab-bags.
   Before picking a file format, the actual shape of existing journal
   entries needs to be inspected (not assumed from the TS interface, which
   only says `Record<string, any>`).
5. **N8N webhooks are stateful side-effects tied to article saves**, not
   pure content storage — this is the one piece that doesn't reduce to "put
   it in a file." Needs a conscious decision on whether it's kept (via some
   remaining trigger), simplified, or dropped.
6. **Asset serving today does caching/MIME handling in-app**
   (`src/routes/assets/[...path]/+server.js`, `max-age=600`) — a static-file
   approach would move that responsibility to the host/CDN, which is a
   behavior change, not just a storage change.

## What's already in good shape

- **Articles are already markdown** — the lowest-effort win, nearly a direct
  file-per-slug mapping.
- **Journal has a real service/remote separation**
  (`journal.service.ts` / `journal.remote.ts`, Zod-validated) — routes don't
  talk to Postgres directly, which means the _storage backend_ is already
  somewhat swappable without touching route/UI code, even if the _shape_ of
  the data needs work.

## Scope note

Findings only, per request — no migration plan or CMS tooling
recommendation. The LinkedIn/n8n automation and view counters are the two
pieces that don't fit "content lives in git" at all; worth deciding what
happens to them before scoping any actual migration.
