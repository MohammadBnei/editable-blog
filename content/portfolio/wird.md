---
title: Wird
description: A Qur’an companion for people who do not speak Arabic. Every word opens onto its root, and a prayer is prepared ahead, then recited one rakʿah at a time with the phone following along.
date: 2026-10-01
stack: [Flutter, Go, PostgreSQL, Authentik, Kubernetes, Argo CD]
gitLink: 'https://github.com/MohammadBnei/wird'
liveLink: 'https://wird.bnei.dev/'
writeup: /blog/reading-the-quran-without-speaking-arabic
---

I do not speak Arabic, and every translation of the Qur’an has already decided
what it means. Wird is the slow road back: read a sūra a word at a time, open
any word onto its three-letter root, and see the other places that root lives.
فَلَك, the orbit in 21:33, shares its root with the ship. يَسْبَحُونَ, the sun
and moon swimming, shares its root with praise.

## Prayer, not scrolling

A prayer is prepared on its own screen: the preset, the number of rakʿahs, the
passage after Al-Fātiḥa, the pace. Then it is recited one rakʿah at a time,
without holding the phone. A Qur’an speech model runs on the phone and follows
the recitation, a steady pace steps in when it is unsure, and large tap zones
cover the rest.

## A sense nobody checked does not ship

Root senses are drafted by a model that consults Lane’s Lexicon and is
forbidden to quote it. Each draft is then tested against how the root’s own
words are used across the Qur’an, and a root the Qur’an does not bear out ships
nothing. Readers who speak Arabic rate what remains. Senses live on the server,
so a correction reaches every phone without a release.

## Offline first

The Qur’an, its morphology and translations are bundled. A reader can install,
open and pray with no network and no account. The Go API and its Postgres run
on my own cluster, deployed by Argo CD. Built in ten days, mostly from a phone,
with agents doing the implementation behind a quality gate.
