---
title: Ukubi Platform
description: A self-hosted Kubernetes platform on three Proxmox hosts — declared in Terraform and Ansible, reconciled by Argo CD, and designed mostly by writing down what I refused to build.
date: 2026-08-17
stack:
  [Kubernetes, Proxmox, Terraform, Ansible, Argo CD, Cilium, Traefik, Longhorn, Prometheus, Loki]
writeup: /blog/rebuilding-my-cluster-on-proxmox
---

The platform everything else here runs on. Three Proxmox hosts, five nodes —
three control-plane, two workers — one of them with a GPU passed through. No
cloud account, no managed control plane, and no step that only exists in my
head.

## What it is made of

| Layer         | Choice                                                            |
| ------------- | ----------------------------------------------------------------- |
| Hosts         | Proxmox VE, three of them, clustered                              |
| Provisioning  | Terraform for the VMs, Ansible for the hosts                      |
| Kubernetes    | kubespray v2.31.0, cluster on v1.35.4                             |
| Networking    | Cilium in chaining mode, MetalLB in L2                            |
| Ingress       | Traefik with IngressRoute CRDs, ACME DNS-01, no cert-manager      |
| Delivery      | Argo CD, an app registry plus an ApplicationSet, one shared chart |
| Builds        | Self-hosted GitHub Actions runners, images built in-house         |
| Storage       | Longhorn by default, NFS for RWX, local-path for node-local       |
| Registry      | Zot, backed by S3-compatible object storage                       |
| Data          | Postgres via Pigsty, three-member Patroni HA                      |
| Secrets       | Infisical, injected at runtime                                    |
| Observability | Prometheus and Grafana, Loki with Alloy, Alertmanager to Discord  |
| Identity      | Authentik, OIDC in front of everything with an admin surface      |

## How it was actually designed

By refusing things. Seven of the first twelve architecture decision records
are rejections: no Vagrant, no Flatcar, no service mesh, no multi-region, no
disaster-recovery theatre, no managed Postgres, no GitOps-managed hypervisor,
no using the secrets manager as a certificate authority.

Writing down a rejection costs the same as writing down a choice and saves
considerably more time later, because the next person to have the idea — very
often me, three weeks on — finds the reasoning instead of the silence.

40 decision records, 183 merged pull requests, 441 commits so far.

## The part I would not skip again

Making the delivery layer tell the truth. Argo CD reported "in sync" while
production was quietly reading a development branch, because `targetRevision`
was set to `HEAD` in places nobody had looked at. A rendering layer that lies
convincingly is worse than one that fails loudly, and finding all of those
took longer than building the cluster underneath them.
