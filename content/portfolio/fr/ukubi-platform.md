---
title: Plateforme Ukubi
description: Une plateforme Kubernetes auto-hébergée sur trois hôtes Proxmox — déclarée en Terraform et Ansible, réconciliée par Argo CD, et conçue surtout en écrivant ce que j'ai refusé de construire.
date: 2026-08-17
stack:
  [Kubernetes, Proxmox, Terraform, Ansible, Argo CD, Cilium, Traefik, Longhorn, Prometheus, Loki]
writeup: /blog/rebuilding-my-cluster-on-proxmox
---

La plateforme sur laquelle tout le reste tourne. Trois hôtes Proxmox, cinq
nœuds — trois de contrôle, deux workers — dont un avec un GPU en passthrough.
Aucun compte cloud, aucun plan de contrôle managé, et aucune étape qui
n'existe que dans ma tête.

## De quoi elle est faite

| Couche          | Choix                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Hôtes           | Proxmox VE, trois machines, en cluster                                     |
| Provisionnement | Terraform pour les VMs, Ansible pour les hôtes                             |
| Kubernetes      | kubespray v2.31.0, cluster en v1.35.4                                      |
| Réseau          | Cilium en mode chaining, MetalLB en L2                                     |
| Ingress         | Traefik et ses IngressRoute, ACME DNS-01, sans cert-manager                |
| Livraison       | Argo CD, un registre d'applications et un ApplicationSet, un chart partagé |
| Builds          | Runners GitHub Actions auto-hébergés, images construites en interne        |
| Stockage        | Longhorn par défaut, NFS pour le RWX, local-path pour le local             |
| Registre        | Zot, adossé à un stockage objet compatible S3                              |
| Données         | Postgres via Pigsty, HA Patroni à trois membres                            |
| Secrets         | Infisical, injectés à l'exécution                                          |
| Observabilité   | Prometheus et Grafana, Loki avec Alloy, Alertmanager vers Discord          |
| Identité        | Authentik, OIDC devant tout ce qui a une interface d'administration        |

## Comment elle a vraiment été conçue

En refusant. Sept des douze premières décisions d'architecture sont des
refus : pas de Vagrant, pas de Flatcar, pas de service mesh, pas de
multi-région, pas de théâtre autour de la reprise après sinistre, pas de
Postgres managé, pas d'hyperviseur piloté en GitOps, pas de gestionnaire de
secrets promu autorité de certification.

Écrire un refus coûte autant qu'écrire un choix et fait gagner bien plus de
temps ensuite, parce que la prochaine personne à avoir l'idée — très souvent
moi, trois semaines plus tard — tombe sur le raisonnement au lieu du silence.

40 décisions écrites, 183 pull requests fusionnées, 441 commits à ce jour.

## Ce que je ne sauterais pas une deuxième fois

Faire dire la vérité à la couche de livraison. Argo CD affichait « in sync »
pendant que la production lisait tranquillement une branche de développement,
parce que `targetRevision` valait `HEAD` à des endroits que personne n'avait
regardés. Une couche qui ment de façon convaincante est pire qu'une couche qui
échoue bruyamment, et retrouver tous ces cas a pris plus longtemps que
construire le cluster en dessous.
