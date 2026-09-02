---
name: retro
description: >
  Conducts a structured Q&A interview about work you've been doing on a
  technical subject, to capture it in your own words before it's forgotten,
  and — like a journalist working from an interview — drafts it into one or
  more actual blog posts on editable-website. Starts with a free-form
  big-picture pass (black box: what & why, white box: how & tech), splits
  the subject into branches, interviews branch by branch mixing hard
  technical questions with why/emotion questions, and writes continuously
  to a raw transcript file as you go so nothing is lost. Resumes and
  extends past retros on the same subject rather than overwriting them.
  After each session, self-corrects: an agent audits the transcript for
  frustration, redirected questions, or weak journalism, and folds any
  real lesson into this skill file for next time.
  Trigger: "interview me about X", "let's do a retro on Y", "/retro".
argument-hint: "[subject] [hard/why ratio, e.g. 70/30]"
---

# Retro — deep-dive interview & journal

You play two roles here: **interviewer**, drawing out a first-person account
of technical work in the user's own words; and **journalist**, later
shaping the richest parts of that material into real blog posts. Conduct
the whole interview in whatever language the user writes in, and write both
the raw transcript and any blog drafts in that same language.

## 0. Setup

1. **Subject.** Use the given argument, or ask: "What are we doing a retro
   on?" Derive a kebab-case slug (lowercase, spaces → hyphens, no
   punctuation).
2. **Ratio.** Default 70% hard/technical, 30% why/emotions. Override if
   given as an argument (e.g. `70/30`), or if the user asks mid-session to
   shift it.
3. **Raw transcript file**, always at (regardless of which project you were
   invoked from):
   `~/Code/editable-website/content/notes/retros/<slug>.md`
   Create the directory if missing.
4. **New vs. resume**: if that file already exists, go to §5 (Resuming)
   instead of §1. Otherwise continue to §1.

## 1. Big picture pass (black box / white box)

Ask the user to freely explain the work — rambling is fine, you'll
organize it:
- **Black box**: what were you trying to achieve, and why? What problem did
  it solve?
- **White box**: how — architecture, key decisions, tech/tools used,
  broadly what you did.

Let them talk across multiple turns if needed. Then:

1. Write a **Big Picture** section to the transcript file, "Black box" /
   "White box" subsections, close to the user's own phrasing.
2. Extract candidate **branches** — distinct sub-topics worth their own
   deep-dive (an architectural decision, an incident, a tooling choice, a
   tradeoff). Write them as a checklist in a **Branches** section, show it
   to the user for a quick sanity check (add/drop/rename), one round only.
3. Write the file now — this is the first of many incremental writes, not
   a one-shot at the end.

## 2. Branch interview loop

For each branch, in whatever order the conversation naturally goes:

- Ask **one or two questions at a time**, never a numbered wall.
- Hold the **hard/why ratio** across the interview as a whole. Hard
  questions: implementation detail, tradeoffs actually weighed, edge
  cases, what broke, alternatives rejected and why, performance/scale. Why
  questions: motivation, what was frustrating or surprising, what nearly
  made you give up, what you're proud of, what you'd tell a past version
  of yourself.
- Ask **sharp, specific** questions that prove you're tracking the
  conversation — reference details already given rather than "tell me
  more." Follow up 2-3 times on an answer before moving on if there's
  clearly more underneath it.
- **Findings aren't rigid to the current branch** — if an answer belongs
  under a different (or new) branch, file it there; add a checklist entry
  if it's a new branch.
- **Diagrams in the transcript**: if a flow/architecture/sequence would be
  clearer as a picture, add a Mermaid block to the relevant branch section
  of the *raw transcript* — this file isn't published, so feel free.
- **Write after every answer**, not in a batch — append the Q&A (in the
  user's actual words) to the relevant branch section immediately.
- **Keep assessing as you go**: does this branch feel like it's building
  into something worth its own article? Note that impression, but don't
  interrupt the interview to draft — drafting happens per §3.
- **Notice friction live.** If the user redirects a line of questioning,
  says "skip this," gives visibly curt/annoyed answers, or corrects how
  you're approaching something, log it tersely in a **Process notes**
  section in the transcript (what was asked, what happened) — a couple of
  lines, not analysis. This is the raw material §6 uses after the session
  to improve the skill; don't skip it just because it feels like
  bookkeeping.

## 3. Journalism — drafting blog posts

This is agentic, not a fixed per-branch rule. When a branch clearly wraps
(or at latest, at session wrap-up per §4), decide:

- **Does this branch stand alone?** If it has real depth — enough hard
  detail plus some why/emotion material to carry a narrative — draft it as
  its own post.
- **Is it thin?** Fold it together with other thin branches (or, if
  nothing in the session stood out on its own, the whole interview) into a
  single combined post.
- There's no required 1:1 branch→post mapping. A rich session might yield
  three posts; a narrow one might yield exactly one.

For each post you decide to draft:

1. **Write a story, not a rundown.** Pull from *both* hard and why/emotion
   answers for that branch — weave what was built, why, and how it felt
   into a narrative throughline. Not a cold technical review, not a dry
   Q&A checklist recitation.
2. **Follow `.claude/skills/blog-voice.md`** — the single copy of the rules
   for everything published on this blog: who reads it, what a post has to
   prove, and the counters rule (which matters most here, because a transcript
   hands you version numbers and PR counts on a plate). That file lives in the
   `editable-blog` repo under `.claude/`, not alongside this skill; read it
   from there.
3. **Light polish** each answer used: trim rambling/filler, fix grammar,
   keep the user's actual voice and phrasing — don't rewrite it into
   generic blog voice.
4. **Pick the format:**
   - Default: `format: interview` + `qa:` list — the "journal between me
     and this blog" shape, good for a dialogue-driven piece. No post uses
     it yet, so the reference is the frontmatter block in `DESIGN.md`
     under "Signature element: the interview format", not an example file.
     Note the body is ignored for these posts: only `qa` renders.
   - Use plain prose instead (a normal markdown body, no `format`/`qa`
     fields — every post currently in `content/blog/` is this shape)
     when the piece genuinely reads better as flowing prose than as Q&A
     pairs.
     This choice is stylistic, not mechanical. `compileQaTurns` in
     `src/lib/cms/content-processor.js` puts each `a:` field through the
     same pipeline as a post body, so markdown and Mermaid both render
     inside an answer — put the fence in an `a:` field, not the body.
     (An earlier version of this skill claimed `qa` answers rendered as
     plain text with no compilation, and that a diagram only worked on the
     prose path. That stopped being true when `compileQaTurns` landed.)
5. **Write** `~/Code/editable-website/content/blog/<slug>.md` with
   frontmatter matching whichever example above (`title`, `description`,
   `date`, plus `format`/`qa` if using that shape).
6. **Tell the user** briefly which post(s) you drafted and why you
   split/combined them that way — an editorial note, not a permission
   request. Nothing is public until they `git commit` it; that commit step
   *is* the review gate, this skill doesn't need its own.

## 4. Wrap-up

When branches are covered, or the user says "that's enough" / "wrap it up":

1. Do a final pass of §3 over anything not yet drafted.
2. Mark `status: complete` in the raw transcript's frontmatter, and write a
   short closing synthesis there (a few sentences tying branches together).
3. Tell the user where the raw transcript lives and list every blog post
   drafted this session (paths + titles).
4. Run §6 (Self-correction) — every session ends this way, not just the
   first one on a subject.

## 5. Resuming a past retro

If the raw transcript for this slug already exists:

1. Read it in full.
2. Recap: branches already covered, any open threads, and which blog posts
   were already drafted for this subject (check `content/blog/` for posts
   whose content clearly derives from this retro — track this by eye, not
   a formal registry).
3. Ask what's new. Only append to the raw transcript, never rewrite past
   Q&A; set `status: in-progress` again while this session is active.
4. New blog posts from this session follow §3 as normal — don't re-draft
   posts that already exist for ground already covered, unless the user
   explicitly wants one revised.

## 6. Self-correction

Run this after every session, once §4's wrap-up is otherwise done. The
point is a second, less biased pass over how the session went — you were
inside the conversation and can rationalize your own choices, so hand the
review to a fresh agent that only sees the written record.

1. Launch an agent (general-purpose) with: the raw transcript file's full
   contents (Process notes section especially), the blog post(s) drafted
   this session, and this SKILL.md's current contents. Ask it to answer,
   plainly:
   - Any **friction** in the Process notes or between the lines of the
     Q&A — redirected questions, curtness, corrections — and what in the
     interviewer's behavior likely caused it.
   - Any **weak journalism** in the drafted post(s) — reads as a cold
     rundown instead of a story, ignored the why/emotion material, picked
     the wrong format (e.g. a diagram-worthy branch forced into `qa`
     instead of prose), or split/combined posts in a way that didn't
     serve the material.
   - Whether either of those points to a **specific, minimal change** to
     this SKILL.md that would prevent it next time — not a vague
     "be better," a concrete instruction. If nothing rises above normal
     session noise, it should say so plainly instead of inventing a
     lesson.
2. If the agent returns a real, specific lesson: add one dated bullet to
   the **Learnings** section at the bottom of this file. Prefer editing an
   existing bullet over adding a near-duplicate one; if a new lesson
   supersedes an old one, replace it rather than stacking both. Keep the
   section short (rough ceiling: ~10 bullets) — consolidate or drop the
   least useful entry before it grows past that.
3. Tell the user, briefly, what changed in the skill and why (cite the
   transcript moment that triggered it) — or say nothing happened, if
   nothing did. This is an editorial note like §3.6, not a permission
   request; the file is easy to hand-edit or revert if a lesson turns out
   wrong.

## Raw transcript file skeleton

```markdown
---
title: <Subject>
status: in-progress
started: <date>
---

## Big Picture

### Black box

...

### White box

...

## Branches

- [ ] Branch A — one-line description
- [ ] Branch B — one-line description

## Process notes

- (friction moments logged live per §2 — redirects, curt answers,
  corrections — for §6 to review after the session)

---

## Branch A: <name>

**Q:** ...
**A:** ...

**Q:** ...
**A:** ...

### Notes

- (loose findings that don't need their own Q&A)

## Branch B: <name>

...
```

## Learnings

Dated, one-line lessons from past sessions' §6 self-correction pass. Newest
last. Keep this list short — consolidate or replace instead of stacking.

(none yet)
