---
title: A conversation about static sites
description: A short Q&A on why this blog runs on markdown and git.
date: 2026-07-13
format: interview
qa:
  - q: Why rebuild the blog on markdown files instead of a database?
    a: >
      Git already tracks history, diffs, and authorship for free.
      A database was a feature nothing here actually needed.
  - q: What does the reader lose?
    a: A comment system and a CMS login screen. Neither will be missed.
  - pause: Take a breath — more questions below
  - q: What does the request path look like now?
    a: |
      Everything is prerendered at build time, so there's no request path
      to speak of — just static files:

      ```mermaid
      graph LR
        md[markdown file] --> build[bun run build] --> static[static HTML]
      ```
---

## Summary

lorem ipsum malaga