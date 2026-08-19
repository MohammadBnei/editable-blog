---
title: Agent Fleet
description: Claude Code agents as Kubernetes workloads on my own hardware — one pod per session, each with a real clone, each able to build, test and open its own pull request.
date: 2026-08-19
stack: [Go, TypeScript, Kubernetes, ConnectRPC, PostgreSQL, React, Bun]
writeup: /blog/running-a-fleet-of-claude-agents-on-my-cluster
---

I wanted coding agents that did not live on my laptop. Not because the laptop
is slow, but because an agent that dies when I close the lid is not
infrastructure — it is a terminal tab with ambitions.

`agent-fleet` runs Claude Code sessions as Kubernetes workloads on hardware I
own. One pod per session, each with a real clone of a real repository, each
able to build, test, commit and open a pull request. I talk to them through a
console. When one wedges itself, it dies and the cluster notices.

## Shape

Six Go and TypeScript components, each with one job, and a hard rule about who
is allowed to touch what.

- **core** — the only holder of the Postgres connection, and the only thing
  with zero cluster permissions. Dispatch, the console API, Discord, log
  reads.
- **provisioner** — the only holder of RBAC, scoped to a namespaced `Role`,
  never a `ClusterRole`. It creates the session pod and owns the git
  lifecycle on shared storage.
- **worker** — TypeScript on Bun. One streaming session, single-shot: it runs,
  it opens its pull request, it exits.
- **sidecar** — a second container in every pod, offering tools over localhost
  and holding exactly one outbound connection back to core.
- **executor** — a Go shim with a single `Exec(argv)` RPC and a read allowlist,
  so a pod that needs to look at the cluster never has to hold credentials
  that could change it.
- **console** — a React SPA, compiled into core's binary rather than deployed
  as a service of its own.

The split is not tidiness. It is the answer to one question asked repeatedly:
if this component is compromised or simply wrong, what is the worst it can do?

## What it cost to get right

215 merged pull requests, 755 commits, 57 architecture decision records, and a
version number that reached 4.10.0 in under a month.

The largest single change was a deletion. The first design gave each
repository one long-lived pod and ran sessions as git worktrees inside it.
That rotted quietly for three weeks — a queue, a lease-and-heartbeat state
machine, worktree lifecycle, branch naming, a recipe system — until one pull
request removed all of it in favour of one session, one pod, one shared home.
Seven decision records were superseded at once, and around 21,000 lines went
away.

The write-up below is about that arc specifically, because it is the most
useful thing I learned building this.
