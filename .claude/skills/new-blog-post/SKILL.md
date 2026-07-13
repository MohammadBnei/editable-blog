---
name: new-blog-post
description: >
  Scaffold a new blog post as a markdown file under content/blog/, matching
  this repo's git+markdown CMS convention. Trigger: "new blog post", "write
  a post about X", "add a blog entry", "/new-blog-post".
---

# New Blog Post

Publishing a post in this repo means committing a markdown file — there is
no admin UI or database (see `CLAUDE.md`). This skill scaffolds that file.

## Steps

1. Determine the title (ask the user if not given) and derive a slug:
   lowercase, spaces → hyphens, strip punctuation. Confirm the slug with the
   user if it's not obvious.
2. Write `content/blog/<slug>.md` with frontmatter matching the existing
   `content/blog/hello-world.md` pattern exactly — only these three keys,
   in this order:
   ```
   ---
   title: <title>
   description: <one-sentence teaser, ask the user or draft one from the topic>
   date: <today's date, YYYY-MM-DD>
   ---

   <body>
   ```
   The body is normal markdown; write what the user asked for, or leave a
   short placeholder paragraph if they only gave a topic and want to fill
   it in later.
3. Ask whether a French translation is wanted. If yes, write
   `content/blog/fr/<slug>.md` with the same three frontmatter keys
   (translated `title`/`description`) and translated body — see
   `content/blog/fr/hello-world.md` for the existing pairing. This is a
   distinct SvelteKit route (`src/routes/blog/fr/[slug]/`), not the same
   page as the English one, per CLAUDE.md's i18n section. If no, skip it —
   there's no fallback mechanism, an English-only post is fine.
4. Do not touch anything else (no route files, no index pages — those
   already read every file under `content/blog/` via `getAllContent`).
