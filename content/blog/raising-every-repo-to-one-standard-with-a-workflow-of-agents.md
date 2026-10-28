---
title: Raising every repo to one standard with a workflow of agents
description: I had a fleet of agents refactor every app in my cluster at once. The agents were never the hard part. What made it safe was turning every rule into a gate that produces evidence a stranger can check, and sending only the real decisions back to me.
date: 2026-10-28
---

## Introduction

I wrote a code standard for my cluster: one document saying how a service reads its config, what an error looks like on the wire, how it logs, how it shuts down, what its CI checks and how its commits are signed. Making a dozen repositories actually follow it — Go, Rust, Bun and Svelte, written by me and by agents at different times — is weeks of careful, boring refactoring. Or a day or two, if you can run the refactoring in parallel.

So I ran it in parallel. One Claude Code session on my laptop ran one workflow script. The script gave each repository its own lane, and each lane walked its pull requests through the same chain of steps, with a different agent at each step. On a good stretch sixteen agents ran at once. Each one was planning, doubting, proving, building, reviewing or merging a change in some repository.

This post is not about how many agents that takes. Spawning agents is cheap, and spawning them in bulk is a for-loop. The thing I want to describe is what makes the output trustworthy when no human reads most of the diffs as they happen. I did not get that from better prompts. I got it from structure:

- one written source of rules, ordered by how strongly each rule is enforced;
- a chain where every step has to hand back evidence, not opinions;
- a narrow channel that sends back to me the decisions only I can make, and nothing else.

## The standard, and why it had to be rewritten first

The first thing I learned was that the standard did not survive contact with the repositories it was meant for.

Before any code moved, I had an agent read the document the way a hostile reviewer would. It found the scope contradicting itself within the first ten lines. It found a section about the fleet that was stale on the day it was written. Most interesting, the shared telemetry package the standard told everyone to import broke the standard's own rule about OTel errors. Only a copy of that package in another repository got it right. Rules written for Go were stated as if they applied to every language, and a Rust service could not follow them literally.

A standard that its own reference code breaks is not a standard. It is a wish. So the first decision was structural: one document with three tiers.

```mermaid
flowchart TB
    subgraph doc["one standard, three tiers"]
        base["cluster baseline: binds every app, language-neutral"]
        svc["service tier: Go rules, with Rust and Dart translations"]
        stat["static tier: static sites"]
    end
    base --> svc
    base --> stat
    repo["each repo's CLAUDE.md"] -.->|"declares its tier + its deltas"| doc
```

The second decision was about order. A rule change lands in the source of truth first (the decision files in `mountain`), then in the standard document, then in the tooling and the per-repo instructions. The workflow enforced that ordering mechanically: every pull request that applied a new rule waited on a `rulesReady` signal, and only the rules pull request in `mountain` resolved it. A fix-first security change that touched no rule started at once.

The third decision is the one that matters most, and it is not new. My cluster's guiding document already ranks rules by how they are enforced. Best is a rule that makes the bad state impossible to represent. Next best is a rule checked automatically. Then comes prose that an agent is trusted to follow. Last is a question for a human. Most of this program was moving rules up that ladder.

## Moving rules from prose into code

The clearest evidence of drift was copies. The guard that refuses to start a service with a missing environment variable existed in seven versions across the repositories. The CI pipeline had been copied by hand into roughly eleven places, each a little different. Every copy is a rule stated in prose, and every copy drifts on its own.

```mermaid
flowchart LR
    subgraph before["before"]
        mp["mountain/pkg (private)"]
        g1["env guard copy"]
        g2["env guard copy"]
        g3["... five more"]
        ci1["checks.yml copy"]
        ci2["checks.yml copy"]
        ci3["... about nine more"]
    end
    subgraph after["after"]
        ug["ukubi-go (public): errs, connectkeys, telemetry, ukubicheck, ErrorKey proto"]
        uc["ukubi-ci (public): reusable go, bun, rust, trailer, image, release workflows"]
        ch["common-app-chart + golden render test"]
    end
    app["every app"] -->|"imports a tagged version"| ug
    app -->|"calls, pinned by sha"| uc
    app -->|"renders"| ch
```

Three moves did most of the work.

**Shared Go code became a public module.** `ukubi-go` took over the error and telemetry packages from the private `mountain/pkg`, with their history. It also takes the fleet's error-key mapping, one shared `ErrorKey` proto, and an analyzer (`ukubicheck`) that turns the standard's Go rules into a `go vet` pass: banned env reads outside config, error keys outside the registry, package-level state, wrong log levels. The analyzer is still in review as I write this. It is the step that turns "the standard says" into "the build fails".

**Shared CI became reusable workflows.** `ukubi-ci` holds the check, image, trailer and release workflows. App repositories call them pinned by commit sha, so a change to CI is a pull request in one place that each app picks up on purpose.

**The Helm chart got a guard before it got features.** Every app in the cluster renders the same chart, and ArgoCD follows `main`. That makes every chart change a change to every app at once. So the first chart pull request adds no feature. It is a golden test that renders every app before and after the change and fails on any diff an app did not opt into. Only then do the features land: network policy that names who may reach a pod, extra routes, a ServiceMonitor, data-lifecycle values. One of them is a refusal. The chart will not render an app that trusts identity headers unless it also restricts ingress to Traefik. That is a rule moved all the way to the top of the ladder. The bad config cannot be expressed any more.

## The chain every pull request walks

Each lane is a list of pull requests in order, because each one builds on the merged result of the one before. Inside a lane, every pull request walks the same chain:

```mermaid
flowchart TB
    plan["plan: what changes, what stays, file:line for every claim"] --> doubt
    doubt["doubt: fresh agent, read-only, sees only the plan and the code"] -->|"every finding answered"| revise["revise the plan"]
    doubt -.->|"touches an owner decision"| halt["lane halts, question comes to me"]
    revise --> proof["proof on the old code: run twice, then one deliberate break"]
    proof -->|"stable and the break fails"| build["build in a fresh worktree"]
    proof -.->|"not stable"| halt
    build --> checks["local checks + proof again"]
    checks -->|"identical, or differs only as planned"| review["independent review"]
    review --> pr["open the PR"]
    pr --> prreview["PR review pass"]
    prreview --> merge["CI green, merge with the expected head sha"]
    merge -.->|"refused or blocked"| halt
```

The steps that earn their place are the ones that produce something checkable.

**The plan has to cite.** Every claim in it names a file and a line. A plan that says "the handler swallows the error" without a line number is not a plan yet.

**The doubt agent never sees the conversation.** It gets the plan and the repository, and one instruction: disprove this. It runs at the highest reasoning effort in the whole chain, because it is the step most likely to save the most time. A finding is not resolved by arguing with it. It is resolved by changing the plan, or by an answer that points at code.

**The proof is written before the change, and against the old code.** It runs twice on `main` to show that it is stable. Then the agent breaks the code on purpose, and the proof must fail. A proof that cannot fail proves nothing. After the build, the same proof runs on the new code. The output must be byte-identical, or differ exactly where the plan said it would. That turns "behaviour unchanged" from a sentence into a diff.

**Models follow the step, not the task.** Planning and review run on the strongest model at high effort. Doubt runs at the highest effort. Writing CI YAML, docs and PR bodies runs on a smaller model at low effort. Watching CI and merging runs on the smallest one. A pure CI, docs or version-pin change skips doubt and proof, because there is no behaviour to disprove. A test-only change keeps the deliberate break.

Here is what that looks like in an actual pull request. The labelled behaviour change in the `ukubi-go` import was that an OTel export failure should log as a warning, not an info line lost in plain text. The proof shows exactly one line moving, the one the plan named:

```text
base (mountain pkg/):
  none:     level=INFO msg="export refused"
  endpoint: level=INFO msg="export refused"

this PR:
  none:     level=INFO msg="export refused"
  endpoint: level=WARN msg=traces err="export refused"
```

Two mutants back it up. One disables the handler and fails the endpoint case. The other moves the call above the early return and fails the no-endpoint case.

## What the gates caught

The chain only matters if it stops things. Here are the stops worth telling, each one a check doing its job.

**A plan that would have quietly overridden me.** I had decided that the new Go module keeps its history from `mountain`. The workflow squash-merges every pull request, and a squash collapses carried history into one commit. The plan agent did not notice. The doubt agent did. It halted the lane, and the question came to me with both ways out written down: a merge commit for this pull request only, or a fresh copy without history. I chose the merge commit. The answer went back into the workflow as an input, not as a chat message, and the lane resumed.

**A plan that relabelled my decision as "not a change".** For the chart's golden test, a plan dropped the read-only token I had asked for and rendered only the public apps in CI. It said this was "already in the brief, not a change to an owner decision". The doubt agent quoted my recorded answer back, and pointed out that the apps left out were exactly the header-trusting ones the next chart change targets. I accepted public-only CI. The doubt agent's condition came with it: every following chart pull request carries the full local run in its body, and nothing claims "every app" for CI.

**A shared proto that would have broken the wire.** One error proto for every service sounds like pure cleanup. But a client in the game matches error details by their fully qualified type name, so renaming the type silently breaks it. The change became additive. Servers attach both the old detail and the new one, and clients learn to read both. Dropping the old one is a later pull request.

**A review tool reviewing the wrong repository.** This one was the workflow's own bug, and the shape of it is worth knowing. The PR-review step used a code-review skill that reads its target relative to the working directory. Every agent in the workflow starts in the same directory. So for a while the reviews of pull requests in `infra-bootstrap` were reviews of whatever happened to be checked out there. The agents noticed, because the findings did not match the diff they had been given. They fell back to a manual review and said so in their output. The fix was two lines in the prompt: change into the PR's own worktree, pass the PR's URL, and check that every finding is about the right repository. A tool that silently reviews the wrong thing reports success just as loudly as one that works.

**Merges that were refused.** Early on, the session's permission classifier denied the merge step in every lane. A sub-agent merging its own pull request looked like "merge without review", and the classifier was right to stop it, because I had not said otherwise. No agent tried to get around it. Each one stopped, reported the exact command it would have run, and left the pull request open. I merged that first batch by hand, after checking CI and the commit footers. Then I made the rule explicit — merge on green, hand me only blockers — and the workflow's merge step changed to match. When a merge is still refused, the step reports `READY` with a reason instead of retrying. On my infrastructure repository only I can merge, and that is still true. The workflow does not have a way around branch protection, on purpose.

## The channel back to me

The design decision I am happiest with is how little reaches me.

A lane halts on one of three things: a gate failing twice, a question that touches a decision I recorded, or something only a human can do. Something only a human can do means an approval on a protected branch, an action on real infrastructure, or a secret. When a lane halts, only that lane stops. The others keep going.

```mermaid
sequenceDiagram
    participant L as lane
    participant G as gate
    participant M as me
    participant W as workflow
    L->>G: plan, doubt findings
    G-->>L: halt: touches an owner decision
    L-->>W: halted {pr, gate, reason}
    W-->>M: question with the options written out
    M->>W: answer, passed as args.owner
    W->>L: resume: cached steps replay, the answered step re-runs
```

The resume is what makes this cheap. The workflow caches each agent's result, keyed by its prompt. My answer goes into the prompt of the step that asked. So on resume every earlier step replays from the cache instantly, and only the answered step and the steps after it run again. A question costs me a minute, not a re-run of the lane.

It also kept a week-long outage from becoming a blocker. My cluster has been down for a week, with no internet in the neighbourhood either. Every pull request that would deploy merged anyway, and its deploy check reports "unverified" instead of pretending. The things that truly need the cluster went into one runbook for me to run when it is back. They are a data export before an app is removed, a migration check against production, and an identity provider that has to exist before a service trusts its tokens. The workflow holds those three pull requests until I send the signal.

## Before and after

Some of the changes are worth seeing as code.

**Secrets stopped being flag defaults.** Three of the reading app's command-line tools took their database DSN or API token as a flag default read from the environment. So `-h` printed the live value, and so did every typo in a flag.

```go
// before
dsn := flag.String("pg", env("DATABASE_URL", "postgres://wird:wird@localhost:5432/wird"), "...")

// after: one parseConfig per binary; -h names the env var, never its value
cfg, _ := parseConfig(flag.CommandLine, os.Args[1:], os.Getenv)
```

The proof counted leaked values in `-h` output, flag errors and one error message, before and after. Every count went to zero, and the dry-run output stayed byte-identical.

**The speech-to-text service started hearing SIGTERM.** As PID 1 in a container, a process with no signal handler gets SIGTERM dropped by the kernel. The Rust service registered its handler after loading its models, which takes several seconds. A pod stopped during that window sat out its whole grace period before Kubernetes killed it.

```rust
// after: the handler exists before the load, so a SIGTERM during it is held
let rt = tokio::runtime::Builder::new_multi_thread().enable_all().build()?;
let shutdown = {
    let _rt = rt.enter();
    shutdown_signal()?
};
```

The same pull request gave pull-request CI its own concurrency group. In the shared group, every push to `main` cancelled whichever pull request's checks were running, and the other way round.

**And in general:**

| | before | after |
|---|---|---|
| shared Go code | a private package, plus copies | one public module, imported by tag |
| CI | a hand-copied file per repo | reusable workflows, pinned by sha |
| commit signing | a mix, some with session URLs | one rule per repo, checked on every PR |
| errors on the wire | free text, sometimes internal text | `{code, key, message}` with a registered key |
| logs | a mix of formats | JSON, one level policy |
| chart changes | land on every app at once | golden-tested against every app first |
| versions | some repos | every repo, from Conventional Commits, shown by the app |

## What is not done

The workflow is still running as I publish this. The Go analyzer, the release workflow and the chart's network-policy refusal are in review. Several lanes wait for the analyzer's first tagged version before they can switch imports. None of the deploys are verified, because there is no cluster to deploy to. I will know whether the logging changes cause a spike of errors in Loki only when it comes back. I would rather say that than imply it.

## What I would keep

**Ask for evidence, not effort.** Every gate in the chain asks the same thing: show me something I can check without trusting you. A cited plan, a proof that fails when broken, a diff that differs only where it said it would. An agent's confidence is free. Evidence is not.

**Give the doubt agent no context.** The most useful agent in the whole workflow knew the least. It did not see my reasoning, so it could not inherit my mistakes.

**Spend your attention on the decisions, not the diffs.** I did not review most of these changes line by line, and I did not need to. The questions that reached me were all real ones. They were mine to answer because they were about what I wanted, not about whether the code was correct.
