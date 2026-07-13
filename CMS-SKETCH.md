# Sketch: git + markdown content model

Not a migration plan — a sketch of the target shape, for discussion. See
`AUDIT.md` for what exists today and why each piece is easy/hard to move.

## Principle

Content is files in the repo. No runtime editor, no admin login, no DB
dependency to render a page. Publishing a post = committing a file. Vite
reads content at build time via `import.meta.glob`; nothing content-shaped
is queried from Postgres anymore.

## Layout

```
content/
  articles/
    en/hello-world.md
    fr/hello-world.md
  pages/
    en/home.yml
    en/resume.yml
    fr/home.yml
    fr/resume.yml
  journal/
    switching-to-markdown.md
static/
  images/
    hello-world/cover.jpg
```

Lang is a folder, not a column — `content/articles/en/` vs
`content/articles/fr/`, mirroring the two-language reality instead of a
`lang` field with implicit fallback rules. A missing translation is just a
missing file (checkable at build time instead of silently rendering blank).

## Per-type shape

**Articles** — frontmatter + markdown body, closest to what's already
stored:

```md
---
title: Hello World
teaser: Short summary for listing pages
publishedAt: 2026-07-01
---

Body content, already markdown today — copies over close to as-is.
```

**Pages** — no body, just the flat field set the templates already read
(`title`, `pillar1`, ...). A YAML file per page+lang is enough; no need to
force these into markdown-with-frontmatter when there's no prose body.

**Journal** — frontmatter for the structured bits, body for anything
prose-shaped, keep the Q&A array as a nested YAML field rather than trying
to flatten it into markdown text:

```md
---
title: Switching to markdown
category: infra
frictionScore: 3
metadata:
  tags: [cms, sveltekit]
qa:
  - q: Why drop the DB editor?
    a: One admin, no need for live editing.
---

Optional free-form notes.
```

## What's cut, not carried forward

- The whole editing UI: `isEditing` store, `PlainText`/`RichText`/
  `PlainTextEditor`, `EditorToolbar`/`EditorControls`.
- `sessions` table, `/login`, `/logout`, `ADMIN_PASSWORD` gate — nothing
  left that needs auth once there's no in-app write path.
- `/api/update-article`, `/api/save-page`, `/api/upload-asset` and the
  `pages`/`articles`/`journal` tables and their migrations.
- The dead ProseMirror path (`src/lib/editor/prosemirror*.js`,
  `src/lib/components/tools/*`) — already unreachable today, definitely not
  worth carrying into the new model.

## What doesn't fit the file model and needs its own decision

These aren't "content" in the git+markdown sense — flagged in the audit,
repeated here because the sketch has nowhere to put them:

- **View counters** — live mutable counts can't be a file. Smallest fit:
  drop them, or point `Footer.svelte` at a third-party analytics snippet
  instead of `/api/counter`.
- **LinkedIn posts + n8n translation webhook** — currently fire as a side
  effect of a Postgres write. Without that write, the trigger has to move
  somewhere else — e.g. a small CI step on push to `content/`, or a
  standalone script run by hand. Out of scope for this sketch; needs its own
  conversation.
- **Assets** — sketch above puts them in `static/images/...` as plain files.
  Fine at current scale; no CDN/dedup/versioning benefit, same trade-off git
  always has with binaries.

## Rendering

Routes stop calling `src/lib/api.js`/`journal.service.ts` against Postgres
and instead read from the `content/` glob at build time — e.g.
`import.meta.glob('/content/articles/**/*.md', { eager: true })` parsed with
a small frontmatter+markdown reader. This turns `/blog`, `/blog/[slug]`,
`/journal`, `/journal/[id]`, `/portfolio`, `/resume`, `/` from DB-backed
server loads into static reads — the biggest simplification in the whole
codebase, since it removes the runtime Postgres dependency for every
content-serving route in one move.
