---
title: Opérateur de surveillance des déploiements
description: Un opérateur Kubernetes qui surveille les Deployments de tout le cluster et envoie un e-mail aux personnes qui ont demandé à être prévenues.
date: 2026-07-13
status: archived
stack: [Go, Kubernetes, Kubebuilder, CRDs, SMTP]
gitLink: 'https://github.com/MohammadBnei/deployment-email-operator'
---

Un opérateur Kubernetes, construit avec Kubebuilder, qui surveille les
ressources `Deployment` dans tous les namespaces et envoie un e-mail quand
l'une des ressources surveillées change.

La configuration est une ressource personnalisée plutôt qu'un fichier de
configuration. Un `DeploymentMonitor` nomme les déploiements à surveiller —
par label ou par annotation — et les adresses à prévenir. Les identifiants
SMTP viennent d'un `Secret`, donc rien de sensible ne se trouve dans la
ressource elle-même.

Le contrôleur réconcilie chaque `DeploymentMonitor` avec l'état réel du
cluster, et tout changement correspondant aux critères d'un moniteur produit
un e-mail formaté.

Il existe parce que je voulais comprendre les opérateurs en en écrivant un qui
fasse quelque chose de réel, plutôt qu'en lisant des explications sur la
boucle de réconciliation. La leçon qui est restée n'est pas l'échafaudage des
CRD — c'est la vitesse à laquelle « prévenir à chaque changement » devient du
bruit, et la part de la conception d'un opérateur qui consiste à décider à
quoi ne pas réagir.

Archivé : remplacé par de vraies alertes sur la plateforme. Alertmanager
atteint Discord, et atteint de plus en plus un agent plutôt qu'un humain.
