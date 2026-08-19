---
title: Deployment Monitor Operator
description: A Kubernetes operator that watches Deployments cluster-wide and emails the people who asked to be told when one changes.
date: 2026-07-13
status: archived
stack: [Go, Kubernetes, Kubebuilder, CRDs, SMTP]
gitLink: 'https://github.com/MohammadBnei/deployment-email-operator'
---

A Kubernetes operator, built with Kubebuilder, that watches `Deployment`
resources across every namespace and sends email when a watched one changes.

Configuration is a custom resource rather than a config file. A
`DeploymentMonitor` names the deployments to watch — by label or annotation —
and the addresses to notify. SMTP credentials come from a `Secret`, so
nothing sensitive is in the resource itself.

The controller reconciles each `DeploymentMonitor` against the live state of
the cluster, and any change matching a monitor's criteria produces a formatted
email.

It exists because I wanted to understand operators by writing one that did
something real, rather than by reading about the reconcile loop. The lesson
that stuck was not the CRD scaffolding — it was how quickly "notify on any
change" becomes noise, and how much of an operator's design is deciding what
not to react to.

Archived: superseded by proper alerting on the platform. Alertmanager reaches
Discord, and increasingly reaches an agent instead of a human.
