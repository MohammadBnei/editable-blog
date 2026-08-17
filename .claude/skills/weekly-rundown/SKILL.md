---
name: weekly-rundown
description: >
  Write the weekly rundown of Mohammad's work across his repos — merged PRs,
  new ADRs, what stalled — as a markdown file under content/blog/weekly/,
  from GitHub CLI data plus agent-read repo state. Trigger: "weekly rundown",
  "write this week's rundown", "/weekly-rundown", or the scheduled
  editable-blog proposal that says to run this skill.
---

# Weekly rundown

A short, honest report on what Mohammad actually did in the last seven days.
It is published at `/blog/weekly`, separate from the long-form articles at
`/blog` (`src/routes/blog/+page.server.js` filters on `directory === 'blog'`
exactly, so a rundown never appears in the article list).

This is a conscience, not a changelog. A week where little shipped is a real
result and should be written as one. Never pad it.

## Repos in scope

- `MohammadBnei/agent-fleet`
- `MohammadBnei/infra-bootstrap`
- `MohammadBnei/editable-blog`

## Steps

### 1. Fix the window

Seven days back from today, `YYYY-MM-DD`. Every query below uses that date;
state it in the post so a reader knows what the numbers cover.

### 2. Pull the facts with `gh`

Per repo:

```bash
gh pr list --repo <repo> --state merged --search "merged:>=<since>" \
  --json number,title,mergedAt,additions,deletions,url
gh pr list --repo <repo> --state open --json number,title,createdAt,isDraft,url
gh issue list --repo <repo> --state open --search "created:>=<since>" \
  --json number,title,createdAt,url
gh api "repos/<repo>/commits?since=<since>T00:00:00Z&path=docs/adr" \
  --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
```

`gh` is on the always-ask permission list, so these prompt. That is expected:
a human opened the proposal that started this session, so a human is there to
answer.

### 3. Read the state, don't just list titles

Spawn one `Explore` subagent per repo with the PR/ADR list from step 2 and ask
it what changed and *why* — reading ADR bodies and PR descriptions, not just
titles, and reporting anything that contradicts the titles. Summaries only;
subagent output is compacted, raw file dumps are not.

The ADRs are where the reasoning lives. A week with a new ADR is usually a
week with a decision worth a paragraph.

### 4. Write it

`content/blog/weekly/<YYYY-MM-DD>.md` (the Monday-or-later date the rundown
covers up to), with the same three frontmatter keys every post here uses, in
this order:

```
---
title: Week of <date> — <the one thing that mattered>
description: <one sentence, concrete: what shipped or what didn't>
date: <YYYY-MM-DD>
---
```

Body, roughly 300–600 words:

- **What shipped** — grouped by repo, by what it does for Mohammad, not by PR
  number. Link the PRs.
- **What was decided** — new ADRs, one line each on the actual trade-off.
- **What stalled** — open PRs older than the window, issues filed and not
  touched, anything started and abandoned. This section is the point of the
  whole exercise; if it is empty, say so explicitly rather than dropping it.
- **Numbers** — merged PR count and net lines, one line. Do not build a table.

Style: match the existing posts (`content/blog/*.md`) — plain, first-person
about the work, no hype, no emoji, no "exciting". Deletion counts as progress
and should be reported as such.

Mermaid is available (see `src/lib/cms/content-processor.js`) but a weekly
rundown rarely needs a diagram. Only add one if the week genuinely changed a
shape.

### 5. Ship it

Commit straight to `main` — this is the one flow in this repo that does not
open a PR:

```bash
git add content/blog/weekly/<date>.md && git commit && git push origin main
```

Commit message: `content(weekly): rundown for the week of <date>`, plus the
repo's `Co-Authored-By` trailer.

Then check the release actually ran — `.github/workflows/release.yml` ignores
root-level `*.md` only, so a commit under `content/` does cut a release and
rebuild the image. If no workflow run appears within a few minutes, say so in
the session instead of assuming the post is live.

## Do not

- Do not touch anything outside `content/blog/weekly/` — the routes and the
  index already read every file in that directory via `getAllContent`.
- Do not invent activity. If `gh` returns nothing for a repo, the rundown says
  that repo was quiet.
- Do not open a PR for the rundown, and do not push anything else to `main`
  while you are there.
