---
name: linkedin-post
description: >
  Write the LinkedIn version of an existing blog post as a markdown file under
  content/linkedin/, ready to paste. Trigger: "linkedin post for X", "write
  the LinkedIn version", "/linkedin-post".
---

# LinkedIn Post

A short version of a post that already exists, written to be pasted into
LinkedIn's composer. It lives at `content/linkedin/<slug>.md`, where `<slug>`
matches the blog post it derives from, and it is served at `/linkedin/<slug>`
behind the shared admin credential.

**Read `.claude/skills/blog-voice.md` first.** The hard rules there apply
without exception — plain, first-person, no hype, no emoji, no "exciting", no
activity counters. What changes is the shape, not the voice.

## The one rule that makes this different

**Never write a fact that is not in the source post.** This is a derived
artefact. If a number, a name or a claim is not in `content/blog/<slug>.md`,
it does not go in the LinkedIn version — go back and check the post rather
than reaching for what you remember about the project. The post was
fact-checked; your memory of it was not.

If the post is wrong, fix the post. Do not fix it here.

## Shape

LinkedIn is not a blog. Three differences drive everything:

1. **It truncates at roughly 210 characters** behind a "…see more". Those
   first two lines decide whether anyone reads the rest, so they carry the
   most concrete thing in the piece — a failure, a number, a specific claim.
   Never a preamble, never "I recently wrote about…".
2. **One idea, not a summary.** The post has ten sections; the LinkedIn
   version argues one of them. A summary of everything is what everyone else
   posts and it says nothing. Pick the single most surprising true thing and
   spend the whole post on it.
3. **The link is the call to action.** End on the post URL, plain. No
   engagement-bait question, no "what do you think?", no hashtag pile.

Hard limit is 3000 characters, but the useful target is 1200-1800 — long
enough to make one argument properly, short enough to read in the feed. The
page at `/linkedin/<slug>` shows the live count and where the fold falls.

## Steps

1. Read `content/blog/<slug>.md` in full. Not a skim — you are looking for the
   one claim worth 1500 characters.
2. Pick the angle and say which one you picked, and why that one, before
   drafting. If the post has a stated angle already (its `description`), the
   LinkedIn version usually sharpens the same one rather than choosing a
   different one.
3. Write `content/linkedin/<slug>.md`:

   ```
   ---
   title: <the hook — usually close to the first line of the post itself>
   description: <one line to yourself: which angle this took and what it cut>
   date: <YYYY-MM-DD>
   source: /blog/<slug>
   ---

   <body>
   ```

   `description` is a note to the author, not a teaser — it is shown on the
   `/linkedin` index so a later reader can see at a glance which angle each
   draft took.

4. Write the body as plain prose with blank lines between paragraphs. Short
   paragraphs, often one sentence — LinkedIn renders a wall of text as a wall
   of text. No markdown headings, no bullets unless the content is genuinely a
   list, no code fences: the composer strips all of it, and what gets pasted is
   the rendered text.
5. Do not touch anything else. The route reads every file under
   `content/linkedin/` already.

## Before you hand it over

Check the rendered length at `/linkedin/<slug>` rather than counting
characters in the markdown — the copy button and the counter both read the
*rendered* text, which is what actually goes in the composer.

Then read the first 210 characters alone and ask whether you would tap "see
more". If not, the hook is buried and the fix is at the top, not the bottom.

## Where these live, and why it matters

`content/linkedin/` is excluded from the RSS feed (`site.config.json`), the
sitemap and robots.txt (`scripts/generate-seo-files.js`), and the search index
(the conditional `data-pagefind-body` on `<main>` in
`src/routes/+layout.svelte`), and the `/linkedin` prefix is gated by
authentik's shared `default/authentik-forwardauth` Traefik middleware
(`helm/values.yaml`).

The search-index one is worth understanding before you trust it. The obvious
mechanism, `data-pagefind-ignore` on the page, does **not** work: it strips the
element's content but Pagefind still indexes the page and falls back to the
`<title>`, so every draft's URL and headline stayed in a public asset. What
works is `data-pagefind-body`, because once any page carries it Pagefind skips
every page that does not. If you add another private section, copy that, and
then run `pagefind --site build` and read the fragments rather than assuming.

Four separate mechanisms, because each covers a different way out of the build
and none of them covers another — auth on the route does nothing about a
search index that is itself a public asset. If you add another derived content
type that should not be public, all four need the same treatment.

The pages are still prerendered into the image, so the gate protects the URL,
not the bytes. Nothing here should be anything worse than embarrassing if it
leaked.
