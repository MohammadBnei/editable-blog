---
title: Voc On Steroid
description: Une plateforme d'apprentissage du vocabulaire — un monolithe Go en Clean Architecture et CQRS, avec répétition espacée et défis quotidiens, hébergé sur mon propre cluster Kubernetes.
date: 2026-07-13
stack: [Go, GraphQL, PostgreSQL, Redis, Kubernetes, OpenTelemetry]
liveLink: 'https://www.voconsteroid.com'
---

Une application web pour découvrir, organiser et surtout retenir des mots
nouveaux : recherche immédiate, exemples en contexte, répétition espacée et
défis quotidiens.

## Fonctionnalités

- **Recherche** — définitions, étymologie, phonétique et audio, en vue simple
  ou détaillée.
- **Listes et étiquettes** — enregistrer un mot dans une collection en un
  clic, l'étiqueter, y revenir délibérément.
- **Exemples en contexte** — littérature, presse et cinéma, filtrables, parce
  qu'une définition sans exemple se retient mal.
- **Défis quotidiens** — des quiz adaptatifs qui suivent ce qui est réellement
  maîtrisé plutôt que ce qui a simplement été vu.
- **Répétition espacée** — révisions programmées à intervalles croissants, avec
  possibilité de forcer le rythme avant une échéance.

## Architecture

Un seul binaire Go, délibérément. Gin pour le HTTP, gqlgen pour l'API GraphQL,
et la Clean Architecture au milieu : les règles du domaine isolées de
l'orchestration des cas d'usage, et les deux isolées de Postgres, Redis et de
la gestion des JWT.

Les commandes et les requêtes sont séparées sur un bus en mémoire : une
commande modifie l'état, une requête le lit, et aucune n'emprunte le chemin de
l'autre. Un `repository` générique donne à chaque entité du domaine un CRUD
typé sans couche de données dédiée, et Google Wire fait le câblage à la
compilation — ce qui compte surtout parce qu'un test peut alors substituer une
implémentation en mémoire.

Logs JSON structurés, métriques Prometheus et traces OpenTelemetry sont émis
par commande et par requête, et arrivent dans la pile d'observabilité de la
plateforme plutôt que dans une pile dédiée.

L'application tourne sur le cluster auto-hébergé décrit ailleurs dans ce
portfolio, avec un flux GitOps : fusion, build, tag, et Argo CD réconcilie.
Les déploiements sont passés d'un après-midi à moins de dix minutes, et d'un
échec deux fois sur cinq à presque jamais.
