---
name: weekly-rundown
description: >
  Write the weekly rundown of Mohammad's work across his repos — merged PRs,
  new ADRs, what stalled — as a markdown file under content/blog/weekly/,
  from GitHub CLI data, the session journal, and agent-read repo state.
  Trigger: "weekly rundown",
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
state it in the post so a reader knows what the rundown covers.

### 2. Pull the facts with `gh`

Per repo:

```bash
gh pr list --repo <repo> --state merged --search "merged:>=<since>" \
  --json number,title,mergedAt,url
gh pr list --repo <repo> --state open --json number,title,createdAt,isDraft,url
gh issue list --repo <repo> --state open --search "created:>=<since>" \
  --json number,title,createdAt,url
gh api "repos/<repo>/commits?since=<since>T00:00:00Z&path=docs/adr" \
  --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
```

`gh` is on the always-ask permission list, so these prompt. That is expected:
a human opened the proposal that started this session, so a human is there to
answer.

### 3. Read the journal for the window

`gh` only sees what became a PR or an issue. The knowledge journal is where
sessions record gotchas, dead ends and deliberately-not-fixed things — the
material for "what stalled" that exists nowhere else, across every repo in the
fleet, not only the three above.

One call. No `repo` (all repos), no `query` (newest-first over the window
rather than ranked against a term you had to guess):

```
journal_search(since: "<YYYY-MM-DD>", limit: 100)
```

Every row is something a session chose to write — pod and session lifecycle
events are no longer journaled (agent-fleet ADR-0055), so there is nothing to
filter out and no `eventType` to select on.

The result is byte-capped (~15 KB). If the response carries a notice that
entries were dropped, do not accept the short answer — a truncated week and a
quiet week look identical. Walk the window backwards in slices instead:

```
journal_search(since: "<YYYY-MM-DD>", until: "<earliest createdAt you got>", limit: 100)
```

Notes:

- Add `query` only to chase something specific a PR or ADR raised. For the
  rundown itself, no query is the point.
- `repo` takes the **bare** name (`agent-fleet`, not `MohammadBnei/agent-fleet`,
  which matches nothing). You rarely want it here.
- A journal entry is a claim, not a fact. If it contradicts `gh`, `gh` wins for
  what shipped and the journal wins for why.

### 4. Read the state, don't just list titles

Spawn one `Explore` subagent per repo with the PR/ADR list from step 2 and ask
it what changed and *why* — reading ADR bodies and PR descriptions, not just
titles, and reporting anything that contradicts the titles. Summaries only;
subagent output is compacted, raw file dumps are not.

The ADRs are where the reasoning lives. A week with a new ADR is usually a
week with a decision worth a paragraph.

### 5. Write it

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
  touched, anything started and abandoned, and whatever the journal recorded as
  skipped, deferred or knowingly broken. This section is the point of the whole
  exercise; if it is empty, say so explicitly rather than dropping it.
- **What it cost** — the trial and error underneath the week: what had to be
  repaired twice, what was reverted, what shipped and then had to be undone,
  what got deleted and why. One paragraph, and it is the other half of the
  point of this post.

Style: match the existing posts (`content/blog/*.md`) — plain, first-person
about the work, no hype, no emoji, no "exciting". Deletion counts as progress
and should be reported as such.

**Never prove the week with activity counters.** No merged-PR counts, commit
counts, ADR counts, lines added or removed, no per-repo `+x/−y`. They measure
typing, not judgement, and a week of 100 repairs to a design that should not
have existed reads as a good week only if you count. Write what was tried and
what it cost instead. Link individual PRs freely — a link is a citation, a
tally is a scoreboard. Numbers about the *system* (deploy time, failure rate,
how many defects sat in one broken path) are evidence and stay.

Mermaid is available (see `src/lib/cms/content-processor.js`) but a weekly
rundown rarely needs a diagram. Only add one if the week genuinely changed a
shape.

### 6. Ship it

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
