---
title: Wird
status: in-progress
started: 2026-10-01
---

## Big Picture

### Black box

A Qur’an companion for prayer, built for someone who does not speak Arabic.
Every word opens onto its three-letter root; a prayer is prepared ahead, then
recited one rakʿah at a time without holding the phone. Idea and build on the
honeymoon, ten days (ADR dates 2026-09-23 → 2026-10-01). Alpha rounds done,
now with testers. https://wird.bnei.dev · https://github.com/MohammadBnei/wird

### White box

Flutter app, offline-first, Go API + Postgres, Go root engine (`jidhr`),
on-device Qur’an speech model for voice-follow. Senses drafted by a model,
checked by `server/cmd/rootcheck`, rated by Arabic speakers.

Process, in the user's words: "fast pace came from experience with agentic
design, architecture and coding. Also the dev process, architecturing ->
planning > adversarial review -> parallel workflow agent with gates on code
quality and QA."

## Branches

- [x] Why Wird exists (anchor post) — published as
      `content/blog/reading-the-quran-without-speaking-arabic.md`
- [ ] Roots — trilateral roots, one aya taken apart. Seed: "deep Semitic dive
      about trilateral letters rooting in the Arabic language, how it carries a
      poetic, interpretative and construction like meaning in even the most
      simple ayas. How it makes the content so rich, so complex but through
      root deconstruction understandable through our emotional parts."
- [ ] Process — idea to testers in ten days: architecture → planning →
      adversarial review → parallel agents behind quality/QA gates.

## Process notes

- Q2 (why not Tarteel): user did not know Tarteel; asked whether it does
  prayer preparation. Checked public descriptions only — no prayer
  preparation, roots not central. Not verified in-app.
- A7 claimed "trusted lexicographies" as a gate; repo showed Lane's text
  rejected for its licence (`data/SOURCES.md:549`). User restated: the
  drafting model consults Lane, never quotes it.
- After first publish, user asked for "an intro and body of the article,
  like a real interview would" — interview format gained an intro body and
  `text:` narration turns.

---

## Why Wird exists

**Q:** Where were you when the idea came, and what were you missing?
**A:** It was my first honeymoon day, and I had time. Time to do what I
wanted for some time: deep dive into the Qur'an, read it for real, take the
time to enjoy understanding it. And linking it to the islamic habits of
praying, I wanted to read and learn ayas in the ritual prayers. But simply
reading it was not natural. I don't like to hold a phone in my hand and have
to scroll, and I wanted to have a bookmark and position system to help me.

**Q:** Quran.com, Ayah and Tarteel exist (bookmarks, position, Tarteel
follows recitation). Why build?
**A:** Oh. I did not know. Can Tarteel also do prayer preparation?
**A:** The roots was essential to me, and the prayer follow along too. So I
think yes, I would have created a project tailored to my needs.

**Q:** First time a root changed an aya for you?
**A:** 21:33 (كُلٌّ فِى فَلَكٍ يَسْبَحُونَ). When I searched for the roots
f-l-k and s-b-h, I was mesmerized by the onirism in the Qur'an, how it was
like paint for my imagination, and how it opens doors to understand the world
with a love prism, far from the cold and archaic modern science viewpoint.

**Q:** "Cold and archaic" science — engineers and hiring readers will
bristle. Which claim do you hold?
**A:** Fair pushback. People hire me for my skills, not my cosmogony and
holistic views on the world. I have a theory on science, so it's not just a
word (archaic). It's using reason as a cutting tool, to separate elements to
understand them on an individual, objectified level instead of coherence and
harmony.

**Q:** Root deconstruction is also cutting. Where does the cut turn back
into harmony?
**A:** The Arabic language is a very structured one, where a root gets a
transformation applied to it to create a verb, a noun, an adjective... This
transformation is the same for every root. So, going back to the root is
actually removing the structure, and bringing out the essence!

**Q:** You had time to read; you built instead. Tooling as avoidance?
**A:** Because I don't speak Arabic. I could only read a translation, and a
text of this magnitude cannot be translated without interpretation. The
roots and the prayer sets was giving me a patient road, of years, to deeply
understand the Qur'an while learning it at a prayer pace!

**Q:** You can't check the meaning, but you built the machine that gives it.
Why trust it?
**A:** I created a community built notation system, so that Arabic speakers
could help the rest of us make sure the senses were correct. Also, the draft
part was very strict, with gates comparing the senses with their actual usage
from Qur'an or trusted lexicographies.
**A:** (on Lane) Yeah, checked by the model in its own checking gate.

**Q:** Ten days on a honeymoon — how did the build fit?
**A:** It was the beauty of it: the thinking part, the architecture, the
design: 1 hour here and there. Launching the agents to do implementation in a
workflow setup: 30 minutes, doable here and there when I get some minutes from
my phone!

**Q:** Where does Wird stand?
**A:** I just finished the alpha rounds, and I am now providing the app to
testers so I can have my first feedback loop. It has a public website where
it's downloadable.

### Notes

- س ب ح = swim/float, and tasbīḥ. ف ل ك = orbit, and fulk (ship). 21:33
  names night, day, sun and moon each in a falak — not planets around the
  sun.
- `jidhr/pkg/root/pattern.go` `apply` is the pattern transformation the user
  describes; the engine reverses it. Use in the roots post.
- Open: has a community rating corrected a sense yet? Hours of code vs
  reading? Should "follows the recitation" be softened while the matcher is
  the open bug?

## Roots

(not yet interviewed)

## Process

(not yet interviewed)
