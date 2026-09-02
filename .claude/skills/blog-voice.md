# Blog voice

The single copy of the rules that govern everything published on this blog.
`new-blog-post`, `weekly-rundown` and `retro` all read this file first, then
add only what is genuinely their own.

It exists because these rules used to be written out three times, in three
skills, with a note in one of them saying "if you change one, change the
other" — which was already wrong, because there were three.

## Who reads this

Two readers, and both are real.

- **A developer**, reading for substance, end to end. They are here for the
  detail: the actual error message, the constant that was wrong, the
  alternative that lost. They can tell the difference between a post that
  explains a system and a post that describes one.
- **Someone deciding whether to hire Mohammad.** They read the first few
  hundred words properly and skim the rest. They are not checking whether the
  code is good. They are checking whether this is a person who thinks before
  building, notices when they are wrong, and can say why.

Neither reader wants a tour. They want an argument with evidence behind it.

## What a post has to prove

**Judgment first. Technical depth is the evidence, never the goal.**

That ordering decides things:

- The opening has to stand alone. A reader who stops after the first few
  hundred words should already know the writer does not guess. If the reason
  the work is interesting only arrives in section nine, the piece is
  structured wrong — move it, do not leave it as a reward for finishing.
- Depth belongs to a claim. A section that goes three levels down into a
  filterbank is excellent when it is proving "I do not copy defaults I have
  not verified", and filler when it is there because the work happened.
- **Under conflict, judgment beats completeness.** Leaving out a real part of
  the system to keep the argument sharp is correct. A post that covers
  everything and argues nothing is the failure mode this rule exists to
  prevent.

One trap worth naming, because it is easy to walk into while being honest: a
run of consecutive sections narrating one's own bugs reads as *this developer
ships bugs*, even when every one of them was caught by a check that existed on
purpose. That is the opposite of the intended message. Frame each as the check
working, and compress — one worked example proves the pattern better than five
do.

## The rules

**Plain, first-person about the work.** No hype, no emoji, no "exciting". No
sanding the story into a tidy narrative where everything worked the first
time.

**Write the trial and error, not the activity.** The wrong turns are the most
valuable material in a build-log post: what was tried and abandoned, what
looked configured and did nothing, what the error message actually meant.
Those stay, in full.

**Deletion counts as progress** and should be reported as such.

**Never prove the work with counters.** No merged-PR counts, commit counts,
ADR counts, lines added or removed, no per-repo `+x/−y`, no version number
offered as an achievement — even when the source material hands them to you on
a plate. They measure typing, not judgement, and a week of a hundred repairs to
a design that should not have existed reads as a good week only if you count.

- **Link individual PRs freely.** A link is a citation; a tally is a
  scoreboard.
- **Numbers about the *system* are evidence and stay**: deploy time, failure
  rate, how long a replica sat broken, how many defects were stacked in one
  broken path.
- **Elapsed time is fine when it carries the story** — "it rotted for three
  weeks before I saw why" — and never as a scoreboard: "ten weeks of work".

**Never claim a measurement that was not measured.** If the source says a
number is an estimate, say estimate. If no one measured latency percentiles,
the post does not have latency percentiles. A plausible number is worse than
no number, because it cannot be checked and it poisons the ones that can.

## Diagrams

Mermaid renders on the prose path. Reach for one when the post turns on a
shape: a before/after topology, who-can-reach-what, or the order in which two
things write the same file. Skip it for a narrative that is genuinely just a
sequence of events — a weekly rundown rarely needs one.

Match the existing idiom: quoted labels, `subgraph` for grouping,
`-.->|"label"|` for the annotated dotted edge. No `classDef`, no inline
colours — the theme handles it, and hardcoded colours break dark mode.

**Verify it rendered.** A parse failure leaves the raw `<pre>` on the page
silently: nothing throws and the build still passes, so grepping the built
HTML for `class="mermaid"` proves only that the fence was matched, not that
mermaid parsed it. Load the page and check:

```js
[...document.querySelectorAll('pre.mermaid')].map((p) => !!p.querySelector('svg'));
```
