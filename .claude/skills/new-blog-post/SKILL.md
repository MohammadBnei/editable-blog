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

## Diagrams

Mermaid is wired into the prose path and you should reach for it. Every
long-form post in the cluster series uses at least one
(`rebuilding-my-cluster-on-proxmox`,
`running-a-fleet-of-claude-agents-on-my-cluster`,
`road-to-self-hosted-kubernetes-cluster`) — a post that describes a
topology, a boundary, or an ordering and ships without one is the odd
one out.

Write a plain ```mermaid fence in the body.
`transformMermaidBlocks` in `src/lib/cms/content-processor.js` rewrites it
to `<pre class="mermaid not-prose">`, and `BlogPost.svelte` lazy-loads
mermaid + svg-pan-zoom, themed from `data-theme`. Any diagram type works,
not just `flowchart` — `sequenceDiagram` is the right choice for an
ordering bug (who writes the file last).

Match the existing idiom: quoted labels, `subgraph` for grouping,
`-.->|"label"|` for the annotated dotted edge. No `classDef`, no inline
colours — the theme handles it, and hardcoded colours break dark mode.

**Reach for one when the post turns on a shape**: before/after topology,
who-can-reach-what, or the order in which two things write the same file.
Skip it for a narrative that is genuinely just a sequence of events.

**Mechanical caveat**: a diagram only renders on the prose path. With
`format: interview`, `qa` answers go through the same pipeline, but the
post *body* is ignored entirely — see `DESIGN.md`. Put the fence in an
`a:` field, not the body, for interview-format posts.

**Verify it rendered.** A parse failure leaves the raw `<pre>` on the page
silently — nothing throws and the build still passes, so
`grep 'class="mermaid'` on the built HTML proves only that the fence was
matched, not that mermaid parsed it. Load the page and check:

```js
[...document.querySelectorAll('pre.mermaid')].map(p => !!p.querySelector('svg'))
```

## Voice

Match the existing posts in `content/blog/`: plain, first-person about the
work, no hype, no emoji, no "exciting". Deletion counts as progress and
should be reported as such.

Write the trial and error, not the activity. **Never prove the work with
counters** — no merged-PR counts, commit counts, lines added or removed.
They measure typing, not judgement. Link individual PRs freely: a link is
a citation, a tally is a scoreboard. Numbers about the *system* (deploy
time, failure rate, how long a replica sat broken) are evidence and stay.

The wrong turns are the most valuable material in a build-log post. What
was tried and abandoned, what looked configured and did nothing, what the
error message actually meant — keep those, and don't sand them into a
tidy narrative where everything worked first time.

(This section and `weekly-rundown`'s "Style" section say the same thing.
If you change one, change the other.)

## French translations

Technically accurate, and written the way a French engineer talks.

- **Keep in English** anything that is a name or an identifier:
  `restore_command`, `streaming`, `failover`, `reinit`, `stanza`,
  `timeline`, `repo`, tool names, flags, file paths. « le `restore_command`
  n'était pas sur le réplica », not « la commande de restauration ».
- **Translate the prose around them** — narrative, reasoning, lessons.
- **Don't invent equivalents**: no « basculement », no « chronologie » for
  timeline, no « dépôt » for repo. If a term would make a French-speaking
  SRE pause, keep the English one.
- Code fences, log lines and commands stay **verbatim**, including inside
  mermaid labels.
- Prefer shorter sentences than a literal rendering gives; French drifts
  into heavy subordinate clauses when translated word by word.
