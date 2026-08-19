---
title: DDG Search
description: Une petite API REST en Go qui relaie la recherche DuckDuckGo et sait renvoyer les résultats en markdown propre — construite surtout comme une chaîne de livraison complète et ennuyeuse.
date: 2026-07-13
status: archived
stack: [Go, OpenAPI, Docker, Kustomize, GitHub Actions, Argo CD]
gitLink: 'https://github.com/MohammadBnei/ddg-search'
---

Une API REST légère devant DuckDuckGo. Ajoutez `?scrape=true` et elle renvoie
les résultats sous forme de document markdown propre plutôt qu'en JSON, ce qui
est la forme la plus utile pour ce qui vient ensuite dans une chaîne de
traitement.

L'API elle-même est volontairement petite. Ce qui valait la peine, c'est tout
ce qui l'entoure :

- **Un contrat, pas seulement des endpoints.** Entièrement décrite en OpenAPI,
  avec une documentation interactive générée depuis la même source.
- **Fermée par défaut.** Authentification basique et limitation de débit
  configurable, parce qu'un relais de recherche ouvert sur Internet est le
  budget de scraping de quelqu'un d'autre.
- **Observable dès la première requête.** Un middleware émet des logs JSON
  structurés avec statut, latence et chemin — sans passe d'instrumentation
  séparée.
- **Une image minimale.** Build multi-étapes, la couche finale ne contient que
  le binaire compilé.
- **Déployée comme tout le reste.** Manifestes Kustomize, versionnage
  sémantique dérivé des messages de commit, un tag d'image poussé par la CI,
  et Argo CD qui réconcilie le cluster avec le dépôt.

Archivé : le déploiement n'existe plus et l'endpoint ne répond plus. Le dépôt
reste un exemple compact de la chaîne complète.
