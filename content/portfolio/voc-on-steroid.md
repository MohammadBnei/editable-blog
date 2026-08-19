---
title: Voc On Steroid
description: A vocabulary-learning platform — a Go monolith built on Clean Architecture and CQRS, with spaced repetition and daily challenges, running on my own Kubernetes cluster.
date: 2026-07-13
stack: [Go, GraphQL, PostgreSQL, Redis, Kubernetes, OpenTelemetry]
liveLink: 'https://www.voconsteroid.com'
---

A web application for discovering, organising and actually retaining new
words: instant lookup, contextual examples, spaced repetition and daily
challenges.

## For the reader

- **Lookup** — definitions, etymology, phonetics and audio, in a simple view
  or a detailed one.
- **Lists and tags** — save a word into a collection in one click, label it,
  come back to it deliberately.
- **Examples in context** — from literature, news and film, filterable, because
  a definition without a sentence rarely sticks.
- **Daily challenges** — adaptive quizzes that track what you have actually
  mastered rather than what you have merely seen.
- **Spaced repetition** — reviews scheduled at widening intervals, with the
  schedule overridable when you are cramming for something.

## Under it

A single Go binary, deliberately. Gin for HTTP, gqlgen for the GraphQL API,
and Clean Architecture through the middle: domain rules isolated from
use-case orchestration, and both isolated from Postgres, Redis and JWT
handling.

Commands and queries are separated over an in-process bus — a command mutates,
a query reads, and neither reaches the other's code path. A generic repository
gives every domain entity type-safe CRUD without a per-entity data layer, and
Google Wire does the wiring at compile time, which mostly matters because it
makes substituting an in-memory repository in a test trivial.

Structured JSON logging, Prometheus metrics and OpenTelemetry traces are
emitted per command and query, and land in the platform's own observability
stack rather than a bespoke one.

It runs on the self-hosted cluster described elsewhere in this portfolio, on a
GitOps workflow: merge, build, tag, and Argo CD reconciles. Deployments went
from an afternoon to under ten minutes, and from failing about two times in
five to almost never.
