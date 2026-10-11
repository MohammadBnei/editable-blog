---
title: Replacing my SSH keys with a login
description: Every host in my homelab had its own key, fetched from a secrets manager before I could touch it. Managing those keys better would not have fixed that. I moved who-I-am off the key file and into the login I already had, and kept the old keys as the way back in. Then I gave the AI agent I work with a login of its own.
date: 2026-10-11
---

## Introduction

This afternoon I tried to log into the etcd witness, a small VM whose only job is to keep my Postgres cluster's quorum honest. The key the Postgres playbooks use was refused. So was the Kubernetes VMs' key. The one that worked was a third, `id_pg_etcd_witness`, which Terraform had generated for that one machine months ago and which I had forgotten existed.

That is the whole problem in one host. My `~/.ssh` holds a key per box: one for the Kubernetes VMs, one for the witness, one each for the build runner, the storage container, the NFS server, the ops hub, the Raspberry Pi. The ones that don't live on my laptop live in Infisical, and every playbook that touches them starts with fetching a key to a temp file and passing `-e ansible_ssh_private_key_file=` on the command line. Earlier the same day, a debugging session had stalled for a while on nothing more than finding a way into one of the Proxmox hosts.

The obvious fix is to manage the keys better: one key everywhere, a short-lived certificate authority, a script that fetches the right one. Each of those keeps the actual mistake, which is that _the key is the identity_. Whoever holds the file is me, on that host, for as long as the file exists.

What I did instead was move the identity somewhere I already maintain it. Every SSH session to a host now starts with a browser login against authentik, the identity provider the rest of my cluster already uses, and the host decides who I may become based on the group I'm in. For me there is no new secret to store, because there is no key.

## The decision I had to reverse first

When I rebuilt this cluster I wrote down what I would not do, and one of those records said: no Wireguard or Tailscale. A mesh VPN as the way into the cluster was, at the time, a moving part I didn't need.

What I wanted now was exactly a mesh. NetBird, which I had just deployed to connect two laptops and a Raspberry Pi, has an SSH server built into its client. The client authenticates each connection with a token from the same login I use for the dashboard, and maps groups to local users. That only works if the hosts themselves join the mesh.

So the old "no" had to be reversed, and the useful part of reversing it was writing down how little it reverses. The hosts become peers for SSH and nothing else. No route into the LAN, no exit node, no pod on the mesh, no Kubernetes traffic over it. The Kubernetes and Postgres inventories still point at LAN addresses and never change. The heavy runs — a full Kubernetes upgrade, a Postgres reconfigure, anything that reboots a node — still run from the ops box on the LAN, because a mesh that drops in the middle of an etcd change is a much worse day than a slow login.

```mermaid
flowchart LR
  subgraph before ["Before"]
    L1["Laptop"] -->|"key per host, from Infisical"| H1["Each host"]
    I1["Internet"] -->|"forwarded root SSH port"| B1["Ops box"]
    B1 -->|"more keys"| H1
  end
  subgraph after ["After"]
    L2["Laptop"] -->|"NetBird SSH, browser login"| H2["Each host (peer)"]
    A2["authentik"] -.->|"who am I, which group"| H2
    O2["Ops box on the LAN"] -->|"heavy runs, unchanged"| H2
    L2 -.->|"LAN key, break-glass"| H2
  end
```

The old keys stay. On the LAN they are the way back in if NetBird or authentik is down; from outside, once the cutover lands, only a single break-glass key will be accepted, through the ops box. Nothing about the new path is allowed to be the only path until it has failed in front of me at least once.

## Configuration I can also click

NetBird's settings live in its database, not in a file I can commit: groups, policies, setup keys, which peer may SSH where. I wanted those in git, and I also didn't want to give up the dashboard, which is the fastest way to see what the mesh thinks is true.

Those two wants fight unless one of them is told it is not in charge. The playbook that declares the account through NetBird's REST API runs in two modes. By default it only _creates_ what is missing, and for everything else it compares and reports: "this policy differs from the file, left as is". Only with an explicit `-e netbird_enforce=true` does it write its own values back, and then only on the fields it names. Anything it doesn't name, it never writes. A change made in the dashboard survives until I decide the file should win, and the next run tells me it exists.

That split earned its keep within the hour. To get access while I was debugging, I had added the hosts' group to my own user in the dashboard. NetBird propagates a user's groups to that user's devices, so my laptop quietly became an "infra host", and the next enforce run switched on its SSH server, because that is what the playbook does to infra hosts. Nothing came of it — the only machine allowed to connect was the laptop itself — but the lesson was clear: group membership is not proof of being a host. Hosts enroll with a setup key and belong to no user. The playbook now only acts on those, and reports any user-owned device that turns up in the hosts' group as drift.

## The check that could not see me

The first design had one more control: a posture check that only let a laptop reach the hosts if it geolocated to France. It cost nothing to add and looked like a cheap second wall.

The first time I tested from home, my laptop could not see a single host. The NetBird server judges location by the address a connection comes from, and at home my laptop reaches the server — which runs inside my own cluster — through the router's hairpin NAT. To the server I was `192.168.1.254`, the router itself, with no country at all. The check could never pass from the one place I use it most.

There was no fix that kept the check honest. A second policy allowing my home subnet would have let in anyone on any network numbered `192.168.1.0/24`, one of the most common defaults a home router ships with. So the geo check is gone, and access rests on what was already doing the real work: a login per session, and membership of the admins group. That is the spike doing its job. It is cheaper to find a blind control on three test hosts than on a train.

## What the rollout caught

The first three hosts were a spike, and it earned its keep twice more before anything else joined.

The SSH rule I wrote had no port on it, because NetBird's SSH protocol felt like it implied one. It doesn't. On the worker, the firewall NetBird rendered read `ip saddr <laptop> accept`: every TCP port on the host, open to my laptop over the mesh. One line — `ports: ["22"]` — and the rule now allows 22 and the 22022 it is redirected to, nothing else.

The other was quieter. Cilium, the cluster's network layer, picks up network devices on its own, and it picked up NetBird's interface too. Its MTU is 1280, so Cilium shrank its own tunnel to match — on that one node. Small packets crossed fine; that is exactly the kind of mismatch that makes large ones hang and looks like an application bug weeks later. Pinning Cilium to the LAN interface, before any other Kubernetes node joined, put the node back in line with the rest.

```mermaid
flowchart LR
  L["Laptop (platform-admins)"] -->|"tcp 22, redirected to 22022 — nothing else"| W
  subgraph node ["k8s-worker-02"]
    W["wt0: NetBird, MTU 1280"]
    E["eth0: LAN, MTU 1500"]
    C["Cilium: pod traffic, WireGuard between nodes"]
  end
  E --- C
  W -.->|"auto-detected at first, now excluded"| C
```

The mesh is for SSH and nothing else, and both fixes are that sentence made concrete: one port in, and no cluster traffic on the mesh interface.

## The agent has to log in too

A browser login is fine for me. It is fatal for an agent. I do a lot of this work with an AI assistant running commands from my laptop, and its first attempt over the mesh stalled at `Connection timed out during banner exchange`: NetBird's client was waiting for someone to click through a login page.

The two tempting answers both give something up. NetBird has service users with API keys, but its SSH server does not accept them; it only takes a short-lived token from its own login service, and its code explicitly leaves service users out of SSH access. Turning SSH authentication off on the hosts would have worked for the agent and removed my identity check along with it.

What worked was applying the same idea to the agent: give it a login of its own, not a key. It is a service account in authentik with an app password. A small script trades that for an authentik token, exchanges it at NetBird's login service for the token the SSH server wants, and uses it as the SSH password. That token is valid for ten minutes.

```mermaid
sequenceDiagram
  participant A as Agent on a NetBird peer
  participant K as authentik
  participant D as NetBird login service (Dex)
  participant H as Host pg01
  A->>K: client_credentials as netbird-agent, with its app password
  K-->>A: id_token
  A->>D: token exchange (RFC 8693)
  D-->>A: JWT for the agent's NetBird user, good for 10 minutes
  A->>H: ssh root@pg01, JWT as the password
  H-->>A: shell, because agent-ssh may become root here
```

So the agent does hold a secret, unlike me. The difference from a key is where it lives and how it dies: one credential, in one place, that authentik can revoke without touching a single host.

The agent now reaches any host with `node.sh pg01 <command>`, by the same name the host has everywhere else — I spent part of this rollout making sure every machine has exactly one name across Proxmox, Kubernetes, Ansible, Pi-hole and NetBird.

One thing worth knowing if you build the same: when authentik refuses an app password it answers `invalid_grant` and logs nothing. Here the cause was a trailing newline the secrets CLI adds to its output.

## Where it stands

Fourteen machines are on the mesh: the three Proxmox hosts, all five Kubernetes nodes, both Postgres servers and the etcd witness, the build runner, the ops box and the Pi-hole. Enrollment is a playbook, stage by stage, and the control-plane nodes and the Postgres members went one at a time, replica before leader. Nothing noticed: the cluster stayed healthy, Patroni never changed leader, Proxmox kept quorum.

`ssh root@pg01` opens a browser tab for me and drops me on the box. For the agent, `node.sh pg01` does the same without the browser.

Not done yet, and not claimed: two storage machines that need a maintenance window, one container with no SSH key to bootstrap from, what happens to open sessions when the NetBird server restarts, and the cutover that narrows the old keys to break-glass. The keys are still on my laptop. Neither of us needs them to get to work.
