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

## The design I got wrong

The first version gave each repository one long-lived pod and ran every
session as a git worktree inside it. Each argument for that was real: keep
dependencies warm between tasks, share one clone instead of paying for a
fresh one, put a queue with leases and heartbeats in front so no task is ever
lost when a pod dies.

It rotted quietly for three weeks, and the tell was the shape of the repairs rather
than how many there were. The cleanup job meant to reclaim dead worktrees had
never once removed anything in production — it ran, reported success, deleted
nothing. The log viewer had six independent defects stacked in a single path
nobody looked at until they urgently needed it. A session died because the
image had no `ps`. Three separate bugs were mis-reporting whether a session
was alive, which is the worst class: the work is fine, but you can no longer
trust what you are looking at.

Every one of those fixes was locally correct, and not one of them made me
re-ask whether the thing being repaired needed to exist. The queue was never
contended. The lease machine recovered work that was never lost. The status
column had eight values and one of them had no writer anywhere in the
codebase. I had built a scheduler for a workload that did not need
scheduling, then spent weeks maintaining the scheduler.

The replacement was a single change that deleted far more than it added:
one session, one pod, one shared home, no queue, liveness reconciled against
Kubernetes because Kubernetes already knows. The agent runs its own
`git checkout -b`, like a person would. Several earlier decision records were
superseded at once, and roughly a fifth of the repository stopped existing.

The write-up below is about that arc specifically, because it is the most
useful thing I learned building this.
