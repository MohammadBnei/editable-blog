---
title: DDG Search
description: A small Go REST API that proxies DuckDuckGo search and can return results as clean markdown — built mostly as a complete, boring, end-to-end delivery pipeline.
date: 2026-07-13
status: archived
stack: [Go, OpenAPI, Docker, Kustomize, GitHub Actions, Argo CD]
gitLink: 'https://github.com/MohammadBnei/ddg-search'
---

A lightweight REST API in front of DuckDuckGo. Add `?scrape=true` and it
returns the results as a clean markdown document instead of JSON, which is the
form most useful to something further down a pipeline.

The API itself is small on purpose. What made it worth building was
everything around it:

- **A contract, not just endpoints.** Fully described in OpenAPI, with
  interactive documentation generated from the same source.
- **Closed by default.** Basic authentication and configurable rate limiting,
  because an unauthenticated search proxy on the public internet is somebody
  else's scraping budget.
- **Observable from the first request.** Middleware emits structured JSON
  logs with status, latency and path — no separate instrumentation pass.
- **A minimal image.** Multi-stage build, final layer holds the compiled
  binary and nothing else.
- **Deployed the same way as everything else.** Kustomize manifests, semantic
  versioning derived from commit messages, an image tag pushed by CI, and
  Argo CD reconciling the cluster to match the repository.

Archived: the deployment is gone and the endpoint no longer answers. The
repository stands as a compact example of the pipeline.
