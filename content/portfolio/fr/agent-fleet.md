---
title: Flotte d'agents
description: Des agents Claude Code exécutés comme des workloads Kubernetes sur mes propres machines — un pod par session, chacun avec une copie de travail complète du dépôt, chacun capable d'ouvrir sa propre pull request.
date: 2026-08-19
stack: [Go, TypeScript, Kubernetes, ConnectRPC, PostgreSQL, React, Bun]
writeup: /blog/running-a-fleet-of-claude-agents-on-my-cluster
---

Je voulais des agents de code qui ne tournent pas sur mon ordinateur
portable. Non pas parce que cette machine est lente, mais parce qu'un agent
qui s'arrête quand je referme l'écran n'est pas une infrastructure.

`agent-fleet` exécute des sessions Claude Code comme des workloads Kubernetes
sur du matériel qui m'appartient. Un pod par session, chacun avec une copie de
travail complète d'un dépôt réel, chacun capable de compiler, tester,
committer et ouvrir une pull request. Je leur parle depuis une console. Quand
l'un se bloque, il s'arrête et le cluster le détecte.

## Forme

Six composants Go et TypeScript, chacun avec une seule responsabilité, et une
règle stricte sur qui a le droit de toucher à quoi.

- **core** — seul détenteur de la connexion Postgres, et seul composant à
  n'avoir aucune permission sur le cluster. Dispatch, API de la console,
  Discord, lecture des logs.
- **provisioner** — seul détenteur du RBAC, limité à un `Role` dans un
  namespace, jamais un `ClusterRole`. Il crée le pod de session et gère le
  cycle de vie git sur le stockage partagé.
- **worker** — TypeScript sur Bun. Une session en streaming, à usage unique :
  il tourne, il ouvre sa pull request, il s'arrête.
- **sidecar** — un second conteneur dans chaque pod, qui expose des outils sur
  localhost et garde exactement une connexion sortante vers core.
- **executor** — un relais Go avec un seul RPC `Exec(argv)` et une liste
  blanche en lecture, pour qu'un pod qui doit consulter le cluster n'ait
  jamais à détenir de quoi le modifier.
- **console** — une SPA React, compilée dans le binaire de core plutôt que
  déployée comme un service à part.

Cette séparation n'est pas une question de propreté. C'est la réponse à une
question posée pour chaque composant : s'il est compromis, ou simplement
défaillant, quel est le pire qu'il puisse faire ?

## Ce qu'il a fallu

215 pull requests fusionnées, 755 commits, 57 décisions d'architecture
écrites, et un numéro de version arrivé à 4.10.0 en moins d'un mois.

Le plus gros changement fut une suppression. La première conception donnait à
chaque dépôt un pod permanent et exécutait les sessions comme des worktrees
git à l'intérieur. Elle s'est dégradée en silence pendant trois semaines — une
file d'attente, une machine à états de bail et de heartbeat, un cycle de vie
de worktrees, une convention de branches, un système de recettes — jusqu'à ce
qu'une pull request supprime tout cela au profit d'un modèle plus simple : une
session, un pod, un espace de travail partagé. Sept décisions ont été
remplacées d'un coup, et environ 21 000 lignes supprimées.

L'article lié raconte cette évolution en détail. C'est ce que j'ai appris de
plus utile en construisant ce système.
