---
title: 'What It Costs to Add an App to My Home Cloud'
description: 'I decided to treat my cluster as a home cloud in the AWS sense, which means it gets judged on what it costs to add an app. So I counted the steps, and started deleting them.'
date: 2026-09-16
format: interview
qa:
  - q: Why work on this now? Nothing was broken.
    a: |
      I accepted the fate of the cluster to be my home cloud, in the AWS sense. Once you
      decide that, the thing you get judged on changes. It is not uptime and it is not how
      clever the networking is. It is what it costs to add an app.

      And by that measure it was bad. Creating a new app was cumbersome: GitHub secrets,
      Infisical secrets, re-used passwords and tokens. None of it was hard. All of it was
      manual, and all of it was the same every time, which is the definition of something
      a platform should be doing for me.

  - q: So what does adding an app actually cost, step by step?
    a: |
      Six things, and I had never written them down in one place before.

      Create the git repo. Write the boilerplate — release flow, CI/CD setup, Helm files.
      Deal with the secrets. Register the app so ArgoCD knows about it. And if it needs a
      database, set up credentials through Pigsty, which is a file modification plus a
      script run.

      That list used to have a seventh item in front of it: a manual DNS record. That one
      is already gone — the domain is a proxied wildcard now, so a new hostname resolves
      and gets a certificate without anyone touching Cloudflare.

      Writing the list out is what made the rest of the day make sense. I had been about
      to optimise the wrong item.

  - q: You asked for shared registry credentials for all the apps. It turns out no app needs one — pull is anonymous, the trust lives on the nodes, and there is not one image pull secret in the whole GitOps tree.
    a: |
      The duplication I was pointing at was real. I just had the consumer wrong. The
      registry password was the most visible repeated thing in the ceremony, so I assumed
      the apps were the ones holding it. They never were — the pipelines are.

      Underneath that is a rule I try to hold to, and it is the reason the pods have no
      credential in the first place. I do not want to add false security for the sake of
      having tokens everywhere. I want the right balance: modification is protected,
      reading is open, and everything is only accessible from inside the cluster.

      ```mermaid
      flowchart LR
        subgraph cluster["inside the cluster"]
          NODES["nodes and containerd"]
          APPS["app pods"]
          ZOT["zot registry"]
        end
        CI["build pipeline"]
        NODES -->|"anonymous read"| ZOT
        APPS -->|"anonymous read"| ZOT
        CI -.->|"authenticated write"| ZOT
      ```

      That is why the registry allows anonymous reads and requires a password to push, and
      why it has no public route at all. A token on the read path would have bought me
      nothing except another thing to rotate.

  - q: But the design you shipped puts the registry push password in a shared project that any app opting in can read. That is a write credential sitting on the open-read side of your own rule.
    a: |
      No, you are right, and it is the design rather than the rule. I am not going to
      defend that as a principled choice.

      Two things make it tolerable for now. This password is shared by all deploying apps
      anyway — it is one account, one line in an htpasswd file, so there is no version of
      this where each app gets its own. Isolating it per app was never on the table.

      And it is temporary. We are moving GitHub itself to self-hosted soon, at which point
      "only accessible from inside the cluster" stops being something I say about the apps
      and becomes true of the pipelines too. The OIDC work is a waypoint on the way there,
      not where I intend to stop.

  - pause: what actually moved

  - q: Of the six steps, how many did this actually improve?
    a: |
      One, and not completely. I would rather say that than pretend otherwise.

      The secrets step is better. The registry password finally exists somewhere on
      purpose, instead of only living in four write-only GitHub secret slots — my own notes
      had already admitted that onboarding a new build repo needed it "from wherever it is
      actually kept, or a full rotation of all of them", which is a sentence that should
      have embarrassed me sooner. There is one copy now, and the pipeline reads it at job
      time with a signed token instead of a pasted one.

      The pilot repo holds no GitHub secrets at all. The other build repos still do;
      converting them is the same workflow edit, not a new design.

      The Infisical side is barely touched. An app with its own secrets still gets its own
      project and its own custom resource, and creating a project still needs a click in
      the UI to grant the operator identity access. That is the piece I would not call
      solved.

  - q: You also planned to pull the repeated boilerplate out of every app's values file, and dropped it. Why?
    a: |
      Because when I looked, the repetition was not there.

      Every candidate failed. The log-alert datasource default already existed. A default
      resources block duplicated a limit range that was already doing that job, and would
      have starved the container registry — whose own values file carries a comment saying
      the namespace default kills it mid-push. The endpoints I thought were repeated
      appeared exactly once each.

      That list had been built by looking for strings occurring in several files, and
      strings that repeat are not the same thing as work that repeats. Most of those hits
      were platform configuration no app ever touches.

      The more useful realisation is that it was one level too deep. The boilerplate that
      actually costs me is not defaults inside a values file, it is the repo skeleton: the
      release flow, the CI workflow, the Helm directory. That is items one and two on the
      list, and a template repo takes both at once.

  - q: The app you tested all this on ended up with no secrets whatsoever. How?
    a: |
      By deleting the reason it had one.

      It is a viewer for a private journal repo, and it used to fetch its own content at
      runtime — an init container cloned the repo, the server re-fetched on a timer. A
      private repo means that clone needs a token, the token needs a synced secret, and the
      secret needs an identity granted on that app's project. Three moving parts and a
      token that expires quietly, to move about 448K of markdown.

      So the markdown went into the image. The token turned out to appear exactly once in
      the whole server, inside the credential helper for that one git fetch. Removing the
      fetch removed the init container, the secret, the volume and the grant together. It
      does not even need a personal access token to write its own deploy commit, because
      the built-in job token covers that, and pushes made with it do not retrigger builds.

      The trade is real: every journal entry now rebuilds the image, where before writing
      an entry needed no build at all. For 448K of text that is fine. For a gigabyte of
      assets it would not be, and I would have kept the fetch.

  - q: Did any of this surface something that had nothing to do with it?
    a: |
      Yes, and it is the part I did not expect.

      Checking the cluster after merging, rather than trusting the merge, showed the
      Infisical backend rolling. Then a documentation-only change — one markdown file —
      rolled it again. The deployment was at revision 301.

      The chart stamps a render timestamp into an annotation on the pod template, so every
      render produces a different pod spec, and with automated sync and self-healing on,
      every commit to the infrastructure repo restarted the service every other app depends
      on for its configuration. It had been doing that for months, harmlessly enough that
      nothing ever complained. Comparing the two replica sets showed exactly one differing
      field, which is what made it safe to ignore that field on purpose instead of guessing.

      Nothing about reading the manifests would have found that. Looking at what the
      cluster did after I changed it found it immediately.

  - q: What is next, and is there anything you have decided not to fix?
    a: |
      A template repo, first. It collapses the git creation and the whole boilerplate step
      into one action, and it is where the pipeline setup I just wrote becomes the default
      instead of something I edit per repo.

      Then the database step. That is the one that actually contradicts calling this a
      cloud: provisioning a database means editing a file and running a script, which means
      a human with access to the infrastructure. Everything else on the list is ergonomics.
      That one is a missing service.

      And one I am deliberately leaving alone: app registration. Generating it came up and
      I argued it down. The file that would be generated is applied automatically, every
      application it describes carries a deletion finaliser, and a bad generation could
      take a persistent volume with it. What it replaces is editing two lines in two files,
      with a checker that already fails the build if they drift. That is a cheap chore with
      a loud failure mode, and automating it would trade a caught error for an uncaught one.
