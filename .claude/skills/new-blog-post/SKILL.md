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

**Read `.claude/skills/blog-voice.md` first.** It carries who reads this blog,
what a post has to prove, and the rules that apply to every post here. This
file only adds what is specific to writing a new one.

## Before you draft

Answer these three in writing, to the user, before any prose. They take a
minute and they are the difference between a post and a pile of material.

1. **What is the angle** — the one thing this argues? Not the subject. "A GPU
   speech-to-text service in Rust" is a subject. "The failure worth designing
   against is not crashing, it is succeeding on the wrong device" is an angle.
   A subject produces a tour; only an angle can decide what to cut.
2. **What does the reader take away**, in one sentence?
3. **What gets cut** to make room for it? If nothing is being cut, the angle
   is not doing any work yet.

**Write the title from the angle, before the draft.** A title extracted from a
good line discovered late is the reliable sign that the piece has no spine —
and it will not survive the first person who reads it, because it describes a
paragraph rather than the post.

Match the existing titles: plain and descriptive
(`how-i-reached-high-availability`, `rebuilding-my-cluster-on-proxmox`). The
thesis goes in `description`, not in a clever `title`.

For a substantial post, or when the material came from somewhere other than
the writer's own memory, use the `architecture-interview` skill to settle the
angle rather than guessing at it — one question at a time, until the three
answers above are real.

## Steps

1. Determine the title (ask the user if not given) and derive a slug:
   lowercase, spaces → hyphens, strip punctuation. Confirm the slug with the
   user if it's not obvious.
2. Write `content/blog/<slug>.md` with frontmatter matching any existing post
   (e.g. `content/blog/how-i-reached-high-availability.md`) exactly — only
   these three keys, in this order:
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
   `content/blog/fr/how-i-reached-high-availability.md` for an existing
   pairing; the twin is found by slug alone, there is no `translationOf`
   key. This is a
   distinct SvelteKit route (`src/routes/blog/fr/[slug]/`), not the same
   page as the English one, per CLAUDE.md's i18n section. If no, skip it —
   there's no fallback mechanism, an English-only post is fine.
4. Do not touch anything else (no route files, no index pages — those
   already read every file under `content/blog/` via `getAllContent`).

## A post the agent writes about its own work

When Mohammad asks the agent to write about what it did and plans to do, run
it as a workflow, not one long draft. Each stage is a separate agent with a
fresh context, so no stage grades its own work.

1. **Facts first.** Write a facts file before any prose: what happened, in
   order, with a source for each item (a PR, a commit, a log line, a handoff
   note). It is the only thing the writer may draw from. Mark what is still
   in flight or planned, and give the date it was true.
2. **Angle.** Answer the three questions from "Before you draft" in the
   facts file. Plans belong to the angle too: what comes next, and why the
   work so far made it necessary.
3. **Write, as the persona.** The writer reads `blog-voice.md` (including
   "When the agent is the author"), both agent-written examples, and the
   facts file, then writes `content/blog/<slug>.md`.
4. **Fact-check.** A separate agent checks every claim against the facts
   file and the sources it cites: names, numbers, dates, links, quotes, the
   order of events. A claim with no source is cut or softened to what the
   source says; a link must resolve publicly (private repos get no link).
   It returns corrections, and the writer applies them.
5. **Review.** A fresh reviewer reads only the post and `blog-voice.md` and
   returns a verdict: does the opening stand alone, does every section prove
   the angle, are there counters, unmeasured numbers, or a run of
   self-inflicted bugs that reads as "ships bugs". Apply, then re-review
   until it says publish.
6. **Translate.** A translator writes `content/blog/fr/<slug>.md` following
   "French translations" below, then a reviewer reads the pair side by side
   for meaning drift.

When two sessions write about the same period, split by angle before either
drafts (for example, one on the design and one on the execution), and link
each post to the other rather than telling the story twice.

## Diagrams

Mermaid is wired into the prose path and you should reach for it. Every
long-form post in the cluster series uses at least one
(`rebuilding-my-cluster-on-proxmox`,
`running-a-fleet-of-claude-agents-on-my-cluster`,
`road-to-self-hosted-kubernetes-cluster`) — a post that describes a
topology, a boundary, or an ordering and ships without one is the odd
one out.

The idiom, when to reach for one, and how to verify it actually rendered are
in `.claude/skills/blog-voice.md`. What is specific to a new post:

Write a plain ```mermaid fence in the body.
`transformMermaidBlocks` in `src/lib/cms/content-processor.ts` rewrites it
to `<pre class="mermaid not-prose">`, and `BlogPost.svelte` lazy-loads
mermaid + svg-pan-zoom, themed from `data-theme`. Any diagram type works,
not just `flowchart` — `sequenceDiagram` is the right choice for an
ordering bug (who writes the file last).

**Mechanical caveat for `format: interview` posts**: the body is the
introduction, rendered above the transcript; `text:` turns are narration
between questions. A fence in the body or a `text:` turn renders, but a
diagram usually belongs in the `a:` field it explains. Answers go
through the same pipeline as a body (`compileQaTurns`,
`src/lib/cms/content-processor.ts`), so markdown and mermaid both work there.

The one-liner to check in the browser:

```js
[...document.querySelectorAll('pre.mermaid')].map(p => !!p.querySelector('svg'))
```

## Voice

In `.claude/skills/blog-voice.md`, once, for every skill that writes here.

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
