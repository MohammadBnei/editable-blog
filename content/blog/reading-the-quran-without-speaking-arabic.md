---
title: 'Reading the Qur’an Without Speaking Arabic'
description: 'I do not speak Arabic, and a translation of the Qur’an is already an interpretation. So on my honeymoon I built Wird: a slow road back to the text, through the root of each word, at the pace of my prayers.'
date: 2026-10-01
format: interview
qa:
  - q: Where were you when the idea came, and what were you missing?
    a: |
      It was the first day of my honeymoon, and I had time. Time to do something I had
      wanted to do for a while: go deep into the Qur’an, read it for real, and take the time
      to enjoy understanding it.

      I also wanted to tie it to the habit of prayer, to read and learn ayas inside the
      ritual prayers themselves. But simply reading it was not natural. I do not like
      holding a phone in my hand and scrolling, and I wanted a bookmark and a position
      that kept track for me.

  - q: Quran.com and Tarteel already exist. They keep your position, and Tarteel follows your recitation word by word. You could have installed one in two minutes.
    a: |
      I did not know Tarteel existed. I found out during this interview.

      But no, I would still have built it. What was essential to me was the roots, and
      following along inside the prayer itself: preparing which passages I recite, then
      being carried through them one rakʿah at a time. Neither of those is what those apps
      are built around. So I would have built something tailored to what I needed anyway.

  - q: Why were the roots essential?
    a: |
      Because I do not speak Arabic. All I could read was a translation, and a text of this
      magnitude cannot be translated without being interpreted. Whoever translates it has
      already decided what it means.

      The roots and the prayer sets gave me a patient road, one that takes years, to
      understand the Qur’an deeply while learning it at the pace of my prayers.

  - pause: the aya that did it

  - text: |
      Most Arabic words are built from a root of three consonants. A pattern is laid over
      the root to make a verb, a noun or an adjective, and the root keeps its family of
      meanings through every word made from it. Wird shows that root under every word of
      the Qur’an, along with the other places the same root appears.

  - q: Give me the first time a root changed an aya for you.
    a: |
      Al-Anbiyāʾ, 21:33.

      > وَهُوَ ٱلَّذِى خَلَقَ ٱلَّيْلَ وَٱلنَّهَارَ وَٱلشَّمْسَ وَٱلْقَمَرَ ۖ كُلٌّ فِى فَلَكٍ يَسْبَحُونَ
      >
      > It is He who created the night and the day, the sun and the moon, each in an orbit,
      > swimming.

      I looked up the roots of two words. **فَلَك**, the orbit, comes from ف ل ك, which is
      also *fulk*, the ship. **يَسْبَحُونَ**, they swim, comes from س ب ح, which is also
      *tasbīḥ*, glorifying God. The sun and the moon are ships, swimming, and the verb for
      their swimming is the verb for praise.

      I was mesmerised by how dreamlike the Qur’an is. It was paint for my imagination, and
      it opened a way to understand the world through love, far from the cold viewpoint of
      modern science.

  - q: '"Cold" is a strong word on an engineering blog. Science is the method most of the people reading this work by.'
    a: |
      Fair. People hire me for my skills, not my cosmogony.

      But it is a position, not a mood. Science uses reason as a cutting tool. It separates
      things to understand each of them alone, as an object, rather than understanding them
      by their coherence and their harmony together.

  - q: But taking a word apart to its root is cutting too. The app does it to every word in the Qur’an.
    a: |
      Arabic is a very structured language. A root has a transformation applied to it to
      make a verb, a noun, an adjective, and that transformation is the same for every root.

      So going back to the root is not cutting the word into pieces. It is removing the
      structure, and what is left is the essence.

  - q: You do not speak Arabic, and you built the machine that tells you what each root means. Why should anyone trust the sense under فَلَك?
    a: |
      Because I did not let the machine be the last word.

      The senses are drafted by a model under strict rules. It is given Lane’s Lexicon
      article for the root, and it is told to consult it and never quote it: a sense that
      only passes because Lane happens to mention it does not pass. Then a separate check
      tests every drafted sense against how the root’s own words are actually used in the
      Qur’an, across all the shapes the root takes. A root whose sense the Qur’an does not
      bear out ships nothing.

      ```mermaid
      flowchart LR
        LANE["Lane's Lexicon"] -.->|"consulted, never quoted"| DRAFT["drafting model"]
        DRAFT --> CHECK["check against the Qur'an's own usage"]
        CHECK -->|"unverified ships nothing"| APP["sense in the app"]
        APP --> RATE["Arabic speakers rate it"]
      ```

      And on top of that, there is a rating system built for the community, so that the
      people who do speak Arabic can tell the rest of us when a sense is wrong.

  - pause: ten days

  - text: |
      The same discipline runs through the code. Nothing in Wird merges without passing a
      gate: the Go and Flutter test suites, end-to-end journeys through the app, and
      quality checks that decide by exit code rather than by opinion. That gate is what let
      the work happen in the gaps of a honeymoon.

  - q: This was your honeymoon. How did building an app fit into it?
    a: |
      That was the beauty of it. The thinking part, the architecture, the design: an hour
      here and there. Launching the agents on the implementation, inside a workflow with
      gates on code quality and QA: thirty minutes, from my phone, whenever I had a few
      minutes.

      The work that needed me was the deciding. The rest did not need me at the keyboard.

  - q: Where does it stand now?
    a: |
      I have just finished the alpha rounds. Now it goes to testers, for the first real
      feedback loop. It is downloadable from its public site,
      [wird.bnei.dev](https://wird.bnei.dev), and the source is on
      [GitHub](https://github.com/MohammadBnei/wird).

  - text: |
      Two more conversations follow this one. The first takes a single aya apart, root by
      root. The second is about the process: how an app went from an idea to testers in ten
      days, built mostly from a phone.
---

Mohammad Bnei does not speak Arabic. Like many Muslims, he reads the Qur’an
through a translation, which means through somebody else’s decisions about what
each word means.

On the first day of his honeymoon he set out to read it differently, and ten
days later he had Wird: a Qur’an app built for prayer. Every word opens onto its
three-letter root. A prayer is prepared ahead, then recited one rakʿah at a
time, without holding the phone. It is now with its first testers.

This conversation is about why. Why build anything when good Qur’an apps exist.
How someone who cannot read the language can trust what an app tells him a word
means. And why, for him, taking a word apart to its root is the opposite of
cutting it up.
