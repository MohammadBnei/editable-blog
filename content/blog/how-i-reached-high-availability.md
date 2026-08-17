---
title: How I reached High Availability
description: We left off on a high note. The Kubernetes cluster was alive. But as any engineer knows, a working system is often just the prelude to the next, more…
date: 2025-09-29
---

## Introduction

[We left off](https://blog.bnei.dev/blog/road-to-self-hosted-kubernetes-cluster) on a high note. The Kubernetes cluster was alive. But as any engineer knows, a working system is often just the prelude to the next, more interesting problem. While the cluster was technically functional, its architecture had a hidden Achilles' heel: a single point of failure for all incoming traffic.

My mission was clear: eliminate it. The tool for the job was MetalLB, and the task seemed simple. I was wrong. What followed was a multi-day investigation down a deep and winding networking rabbit hole. This is the case file for that investigation—a detective story that starts with misleading TLS errors, leads to phantom network blocks, and ends with the unmasking of a culprit buried in the very foundation of my virtualization tools. Join me as we solve the case of the unreachable cluster.

## Act 1: The Initial High-Availability Goal

- **The Problem:** My self-hosted Kubernetes cluster had a single point of failure. My router could only forward traffic to one node's IP, defeating the purpose of a multi-node setup.
- **The First Idea:** Use a Raspberry Pi as a reverse proxy to distribute traffic.
- **The Expert Opinion:** This just moves the single point of failure to the Pi. The Kubernetes-native solution is to use MetalLB to provide a single, highly-available Virtual IP (VIP).
- **The First Fix:** We corrected my MetalLB configuration: moved the IP address pool to my main LAN subnet (`192.168.1.x`) and removed the `nodeSelector` to allow any node to become the leader for the VIP.

## Act 2: The Deceptive "It Didn't Work" Phase

- **A New Mystery Emerges:** After applying the MetalLB fix, my Traefik service was still stuck with its old IP address from the wrong subnet.
- **The Lesson:** Kubernetes services have "IP stickiness." MetalLB won't change an already-assigned IP.
- **The Solution:** We forced a reallocation by temporarily "toggling" the service type from `LoadBalancer` to `ClusterIP` and back again. This successfully assigned a new, correct VIP to Traefik.

## Act 3: The Real Problem Surfaces - The Wall of Errors

- **The Symptoms:** With the VIP correctly assigned, a new, more serious problem appeared. All external connections failed with an `SSL_ERROR_SYSCALL`, while my Traefik logs showed a cryptic `local error: tls: bad record MAC`.
- **The First Wrong Turn:** The `bad record MAC` error strongly suggested a "man-in-the-middle" device corrupting TLS packets. We suspected an overly aggressive firewall on my router or VMs host.
- **The Plot Thickens:** I confirmed it wasn't my main internet router, because the bad `record MAC error` still occurred when connecting from another computer on my local network, proving the traffic corruption was happening closer to the cluster. Then, `ping`ing the VIP revealed an even deeper issue: `Destination Host Unreachable`. We couldn't even reach the IP at a basic network level.

## Act 4: Chasing Network Ghosts

- **The Second Wrong Turn:** An "unreachable" host means no ARP reply. We hypothesized that Cilium's firewall was blocking MetalLB's ARP announcements. We even drafted a `CiliumNetworkPolicy` to allow the traffic.
- **The Breakthrough Clue:** The `arp -a` output showing a **successful** ARP entry for the VIP and logs showing MetalLB _was_ announcing the service. ARP wasn't the problem after all. The node was reachable at Layer 2.
- **The Smoking Gun:** The next step was a `tcpdump` on the leader node. The packet capture revealed the definitive truth:
  1.  The request packet arrived correctly on interface `eth1` (my main LAN).
  2.  The reply packet tried to leave through a completely different interface, `eth0`.
  3.  A stateful firewall (the VMs host itself) saw this mismatched reply, dropped it, and killed the connection.
- **The Diagnosis:** We had found the true culprit: **Asymmetric Routing**.

## Act 5: The Final Culprit and The Fix

- **The Final Piece of Evidence:** Reviewing the `ip route` table of my VM, which confirmed the diagnosis. My node's default route was incorrectly pointing to the `eth0` interface, a private management network created by Vagrant.
  ```
  default via 192.168.121.1 dev eth0
  ```
- **The Root Cause:** This is a fundamental quirk in Vagrant's design. It requires a management NAT network, which competes with any bridged network for the default route, creating the asymmetric routing problem.
- **The Test:** We proved the fix with a temporary command to manually delete the bad route and add the correct one. It worked instantly.
  ```bash
  sudo ip route del default && sudo ip route add default via 192.168.1.254 dev eth1
  ```
- **The Permanent Solution:** I codified this fix in my `Vagrantfile`, using a shell provisioner set to `run: "always"` to enforce the correct default route on every single boot.

## Epilogue: The Domino Effect

- With the routing fixed, the cluster could finally talk to the internet, which solved the very first problem we saw: the failing `ClusterIssuer`.
- `cert-manager` was now able to contact Let's Encrypt, issue a valid certificate, and Traefik began serving it correctly.
- All the TLS errors vanished, and the cluster was fully, correctly, and reliably online.

## Lessons learned

- **Address Single Points of Failure (SPOF) Systematically:** Our journey began with eliminating an SPOF. The lesson is to always pursue robust, architecturally sound solutions (like Kubernetes-native MetalLB) rather than simply moving the SPOF to another component.

- **Networking Troubleshooting: Follow an L7-to-L2 Approach (Iteratively):**
  - **Application & Service Layer (L7/K8s):** Begin with application logs (Traefik), service status, and certificate validity (`cert-manager`). Confirm what the application _thinks_ is happening. Verify Kubernetes service-specific config (like `externalTrafficPolicy` or whether a `LoadBalancerIP` is `sticky`).
  - **Network Policy & Stateful Firewalls (L3/L4):** Check CNI policies (Cilium), host iptables, and any VM/hypervisor firewalls. These often silently drop connections based on state.
  - **Basic IP Connectivity (L3):** Use `ping` for reachability and `traceroute` for path. If `ping` fails with "Destination Host Unreachable," always check Layer 2.

- **`arp -a` is Critical for L2 Diagnostics:** When basic `ping` fails, `arp -a` confirms if the IP is even resolving to a MAC address. A successful ARP reply shifts the focus immediately to routing or higher-layer issues.

- **`ip route` Maps Your World:** If ARP works but traffic still fails, inspect the host's routing table. Misconfigured default gateways, competing routes, or incorrect interface assignments (`eth0` vs. `eth1`) are common culprits for asymmetric routing.

- **`tcpdump` is the Ultimate Truth Serum (L2-L7):** When logs mislead and pings don't tell the whole story, `tcpdump` reveals precisely what packets are arriving, leaving, and being dropped. It was the definitive tool that exposed the asymmetric routing.

- **Know Your Tools' Hidden Quirk:** Understand the default behaviors of your infrastructure tools. Vagrant's automatic management network (`eth0`) creating a competing default route was the hidden antagonist in our debugging journey.

- **Trust But Verify, Always:** Don't assume. Don't assume a `LoadBalancer` IP will change automatically. Don't assume your router isn't interfering. Don't assume a `ping` failure means ARP is broken. Test and get concrete data for every assumption.

---

**Part 3 is up:** [Running a fleet of Claude agents on my own cluster](/blog/running-a-fleet-of-claude-agents-on-my-cluster) — what I built on top of this cluster once it stopped falling over, and the design I deleted to get there.
