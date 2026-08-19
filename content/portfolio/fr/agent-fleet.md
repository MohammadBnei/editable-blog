---
title: Flotte d'agents
description: Des agents Claude Code exécutés comme des workloads Kubernetes sur mes propres machines — un pod par session, chacun avec un clone complet du repository, chacun capable d'ouvrir sa propre pull request.
date: 2026-08-19
stack: [Go, TypeScript, Kubernetes, ConnectRPC, PostgreSQL, React, Bun]
writeup: /blog/running-a-fleet-of-claude-agents-on-my-cluster
---

Je voulais des agents de code qui ne tournent pas sur mon PC. Non pas parce
que le PC est lent, mais parce qu'un agent qui s'arrête quand je referme
l'écran n'est pas une infrastructure.

`agent-fleet` exécute des sessions Claude Code comme des workloads Kubernetes
sur du matériel qui m'appartient. Un pod par session, chacun avec un clone
complet d'un repository réel, chacun capable de compiler, tester, committer et
ouvrir une pull request. Je leur parle depuis une console. Quand
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

## La conception que j'ai ratée

La première version donnait à chaque repository un pod permanent et exécutait
chaque session comme un worktree git à l'intérieur. Chacun des arguments était
réel : garder les dépendances chaudes entre deux tâches, partager un seul
clone au lieu d'en payer un neuf à chaque fois, mettre devant une file
d'attente avec baux et heartbeats pour qu'aucune tâche ne soit perdue si un
pod meurt.

Elle s'est dégradée en silence pendant trois semaines, et le signal était la
forme des réparations, pas leur nombre. Le nettoyage censé récupérer les
worktrees morts n'avait jamais rien supprimé en production — il tournait,
annonçait un succès, ne supprimait rien. Le lecteur de logs cumulait six
défauts indépendants dans un seul chemin que personne ne regardait avant d'en
avoir un besoin urgent. Une session est morte parce que l'image n'avait pas
`ps`. Trois bugs distincts se trompaient sur l'état vivant ou non d'une
session, ce qui est la pire catégorie : le travail continue, mais on ne peut
plus faire confiance à ce qu'on lit.

Chacun de ces correctifs était localement juste, et aucun ne m'a fait
redemander si la chose réparée devait exister. La file n'a jamais été
contendue. La machine à baux récupérait un travail qui n'était jamais perdu.
La colonne `status` avait huit valeurs, dont une que rien n'écrivait nulle
part dans le code. J'avais construit un ordonnanceur pour une charge qui n'en
demandait pas, puis passé des semaines à maintenir l'ordonnanceur.

Le remplacement fut un seul changement qui a supprimé bien plus qu'il n'a
ajouté : une session, un pod, un espace de travail partagé, aucune file, et
l'état vivant réconcilié avec Kubernetes, puisque Kubernetes le sait déjà.
L'agent fait son propre `git checkout -b`, comme le ferait une personne.
Plusieurs décisions antérieures ont été remplacées d'un coup, et près d'un
cinquième du repository a cessé d'exister.

L'article lié raconte cette évolution en détail. C'est ce que j'ai appris de
plus utile en construisant ce système.
