---
title: Dreamer Journal
description: A dream journal that interprets what you write — voice or text in, several schools of interpretation out, with a credit system so the model bill stays finite.
date: 2026-07-13
stack: [SvelteKit, LLM, Web Speech API, Kubernetes]
gitLink: 'https://github.com/MohammadBnei/dream-analyst'
liveLink: 'https://dreamer.bnei.dev'
---

A journalling app for dreams, built with SvelteKit, where the entry is only
half the point — the other half is what a language model makes of it.

## What it does

You record a dream by typing or by speaking it, using the browser's own speech
recognition, because the realistic moment for this is thirty seconds after
waking up and typing is too much to ask.

The model then returns a reading and a set of symbolic tags. The reading is
not one-size-fits-all: you choose the frame. Jungian, reading for archetypes
and the shadow. Freudian, reading for repression and conflict. A plain
summary, for when you want the themes and nothing else. Or an Islamic reading,
grounded in that tradition's own hermeneutics of dreams.

From there it is a conversation — you can question the interpretation, push on
a symbol, or ask what it makes of the same dream told differently.

Entries are stored encrypted and indexed by date, so the archive is worth
something over months rather than being a novelty that survives a week.

## The unglamorous part

A credit system. Every analysis and every chat turn costs a model call, and a
personal project with an open-ended model bill is a personal project you
eventually switch off. Users get a daily quota; the app stays affordable to
run, which is the only reason it is still running.
