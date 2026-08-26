---
title: Le réplica qui ne pouvait pas se réparer tout seul
description: Un agent IA a traduit le texte depuis l'anglais. Un réplica Postgres est resté mort pendant plus d'une journée sans que rien ne le signale. Et le correctif évident n'aurait rien corrigé, parce que chaque nœud sauvegardait dans son propre répertoire local depuis le début.
date: 2026-08-26
---

## Introduction

Les billets précédents de cette série racontent comment ce cluster est né : [construit à partir de machines vides](/blog/road-to-self-hosted-kubernetes-cluster), [le point de défaillance unique retiré de devant lui](/blog/how-i-reached-high-availability), [démonté puis reconstruit de façon déclarative sur Proxmox](/blog/rebuilding-my-cluster-on-proxmox), et enfin [une flotte d'agents posée par-dessus](/blog/running-a-fleet-of-claude-agents-on-my-cluster). Quelque part là-dessous tourne un cluster Postgres à deux nœuds géré par Patroni, correct depuis assez longtemps pour que j'aie arrêté d'y penser.

Le 25 août, je suis allé voir pourquoi une application photo était tombée. Elle était tombée pour une raison qui n'a rien à voir. Mais tant que j'y étais, j'ai remarqué qu'un des deux nœuds Postgres était un réplica non `streaming` depuis plus d'une journée. Le cluster tournait sur un seul nœud pendant tout ce temps. Rien n'avait alerté. Rien ne l'aurait fait.

Voici l'histoire du lendemain : ce qui était réellement cassé, pourquoi le correctif dont j'étais certain était faux, et le piège que ni moi ni le runbook que j'avais écrit n'avions vu venir.

## Le réplica mort depuis une journée

`pg-proxmox-1` était bloqué en `state=starting`, `lag=unknown`, `tl=None`. Son log Postgres n'avait qu'une chose à dire, toutes les cinq secondes, depuis un jour et demi :

```
FATAL: could not receive data from WAL stream: ERROR: requested WAL segment
       0000001F0000003200000078 has already been removed
LOG:   waiting for WAL to become available at 32/78000018
```

Le leader avait recyclé le WAL dont le réplica avait besoin. C'est un comportement normal : `max_slot_wal_keep_size` vaut 18 Go, et au-delà le leader arrête de garder des segments en otage pour un réplica qui ne suit pas. Ce qui l'est moins, c'est la suite : **un réplica dans cet état ne peut jamais se rétablir seul.** Il rejoue la même requête indéfiniment. Pas de backoff vers une autre stratégie, pas de repli, pas d'escalade. Juste la même ligne, toutes les cinq secondes, jusqu'à ce qu'un humain tape `patronictl reinit`.

J'ai tapé `patronictl reinit`, et trente secondes plus tard le cluster était sain.

C'était la deuxième fois. La première remonte au 15 août, dans l'autre sens — c'est l'autre nœud qui avait décroché. Mes propres notes l'avaient prédit : _« cela se reproduira après chaque failover brutal avec divergence de timeline … un humain devra lancer `reinit` à chaque fois. »_ Je l'avais écrit, j'étais d'accord avec, et je n'avais rien fait. Petite leçon au passage sur la différence entre noter un risque et le traiter.

## Le correctif évident qui ne corrige rien

Je connaissais le correctif avant de commencer. Postgres a une réponse à ça depuis toujours : donner au réplica un `restore_command`, pour qu'en cas d'échec du `streaming` il aille chercher le segment manquant dans l'archive WAL. pgBackRest tourne déjà sur les deux nœuds. L'archive existe. C'est une ligne de config.

Ça n'aurait rien corrigé, et comprendre pourquoi est le vrai résultat de toute cette histoire.

`repo1-path=/pg/backup` est **un répertoire sur chaque nœud**. Pas un repo partagé — un chemin local qui porte le même nom à deux endroits. Chaque nœud sauvegardait dans sa copie privée, et après des mois de failovers les deux avaient divergé :

| Nœud                       | Plage d'archive WAL détenue                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `.207` (leader actuel)     | `0000001B00000018000000C4` → `0000001F00000033000000AF` (timeline 31)     |
| `.205` (le réplica bloqué) | `0000001E0000003000000085` → `0000001E0000003200000077` (timeline **30**) |

Le segment dont `.205` avait besoin est sur la timeline 31. Il existait. Il était dans le repo de `.207`, que `.205` n'a aucun moyen de lire. Un `restore_command` sur `.205` aurait interrogé une archive ne contenant aucun WAL de timeline 31 — et il aurait eu l'air parfaitement configuré en le faisant.

Une cause racine, trois conséquences, et une seule était celle que j'étais venu chercher :

1. **Les sauvegardes ne survivent pas au nœud qui les héberge.** `.205` vit sur `server1`, resté [isolé du LAN pendant 23 h 40](/blog/rebuilding-my-cluster-on-proxmox) la veille, quand son uplink USB est sorti de son bridge sans que rien ne l'y remette. Perdre cette VM, c'est perdre toutes les sauvegardes qu'elle contient. C'est un problème de durabilité déguisé en système de sauvegarde.
2. **L'archive se scinde à chaque failover.** Aucun des deux repos ne détient un historique complet, donc aucun n'est une source de PITR fiable à travers un changement de rôle.
3. **Aucun réplica ne peut se réparer tout seul**, ce qui explique exactement pourquoi un `reinit` manuel était le seul remède les deux fois.

Le détail qui pique : un bucket Garage et une clé d'accès pour précisément ça avaient été provisionnés le 26 juillet et jamais utilisés. Le playbook qui les crée le dit dans son commentaire : _« provisoire — renommer librement une fois la config `pgbackrest_repo` de pigsty écrite. »_ Elle ne l'a jamais été. Le bloc est resté commenté, et Pigsty est silencieusement retombé sur son défaut `local`.

## D'abord l'alerte

Avant de toucher à tout ça, j'ai livré la plus petite pièce, parce que le pire dans cet incident n'était pas la panne. C'était qu'elle soit restée invisible une journée et qu'on la trouve par hasard.

```
(count(patroni_replica == 1 and on(instance) patroni_postgres_streaming == 0) or vector(0)) > 0
```

Dix minutes, contre le VictoriaMetrics de Pigsty. Assez simple pour donner l'impression de ne pas mériter d'explication — exactement le genre d'expression qui vous mange.

**Le `or vector(0)` est structurel, pas décoratif.** `count()` sur un vecteur vide ne renvoie pas `0` — il renvoie _no data_. Et cette règle est en `noDataState: Alerting`. Donc le cas sain, zéro réplica non `streaming`, aurait produit _no data_, donc « alerting » : une alerte toute neuve qui se déclenche en permanence sur un cluster en parfaite santé, et qu'on coupe en une semaine. J'ai testé les deux formes sur des données réelles avant de commit :

```
bare count()        -> EMPTY (no data)   <- se déclencherait indéfiniment sur un cluster sain
... or vector(0)    -> 0                 <- correct
```

`execErrState` et `noDataState` sont tous les deux à `Alerting` volontairement, et ce n'est pas de la paresse. La datasource interrogée par cette règle tourne sur `.205`. Si c'est `.205` qui est mort, l'erreur de requête **est** le signal que je veux.

## Quatre vérifications avant d'écrire la moindre ligne de config

Le plan était désormais : pointer pgBackRest sur le bucket Garage pour que les deux nœuds partagent un seul repo, et seulement ensuite ajouter le `restore_command`, qui n'a aucun sens — qui est pire que rien — tant que le repo n'est pas partagé.

J'ai écrit tout ça dans une ADR, puis pris le temps de vérifier quatre hypothèses, parce qu'un run Pigsty sur un cluster de base de données vivant n'est pas l'endroit où j'ai envie de découvrir des choses.

| Vérification                                | Résultat                                                                                                                                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Peut-on utiliser l'endpoint LAN ?           | **Non.** Le driver S3 de pgBackRest 2.58 n'a pas d'option de schéma — il parle toujours TLS. Garage sert du HTTP en clair sur `:3900`. Et `garage.bnei.lan` ne résout pas depuis les nœuds pg |
| `s3.bnei.dev` est-il joignable depuis eux ? | Oui — `403` depuis `.207`, c'est-à-dire l'erreur d'auth de Garage : la requête arrive. Grey chez Cloudflare, donc pas de passage par l'edge                                                   |
| L'origin lock bloque-t-il ?                 | Non — l'IngressRoute `garage-s3` ne porte aucun middleware, et l'allowlist admet `192.168.1.0/24` de toute façon                                                                              |
| Les credentials fonctionnent-ils ?          | Oui — les clés provisionnées en juillet et jamais touchées s'authentifient sur `pg-backup` avec une requête signée : HTTP 200, `KeyCount 0`                                                   |

La première ligne est la plus intéressante. `192.168.1.199:3900` était l'endpoint évident : le moins de sauts, pas de Traefik, pas de DNS. Il n'est simplement pas disponible pour ce client, et on l'apprend en lisant l'aide de pgBackRest et en remarquant ce qui _n'y est pas_ — `--repo-storage-host`, `--repo-storage-port` et `--repo-storage-verify-tls` existent, et rien ne permet de choisir `http`.

## L'échec qui rapporte un succès

Les credentials passent par `lookup('env', ...)`, parce que `pigsty.yml` est versionné dans git et que les secrets n'y entreront pas. Le run doit donc être wrappé par Infisical.

J'ai testé le cas non wrappé au lieu de le supposer, et c'était pire que prévu :

```
env -u PGBACKREST_S3_ACCESS_KEY ...   ->   key=[]  + SUCCESS
```

Un `lookup('env')` nu sur une variable absente renvoie une chaîne vide, et Ansible marque la tâche comme **réussie**. Un run non wrappé aurait écrit un `pgbackrest.conf` sans credentials, affiché un PLAY RECAP vert, et laissé le piège sur `main` pour la prochaine personne qui lance Pigsty sans lire le commentaire au-dessus du bloc.

Refermé avec `or undef(...)`, qui échoue au moment du template en nommant la variable manquante. Les deux chemins retestés :

| Run              | Avant                  | Après                                                                   |
| ---------------- | ---------------------- | ----------------------------------------------------------------------- |
| non wrappé       | `key=[]` + **SUCCESS** | `PGBACKREST_S3_ACCESS_KEY is empty - the run must be Infisical-wrapped` |
| wrappé Infisical | résout                 | résout (clé + secret de 64 caractères)                                  |

Gardez cette forme en tête — _l'échec qui rapporte un succès_ — parce que c'est tout le thème de la suite.

## Le run, et les deux pièges qui se déclenchent à l'heure dite

Deux pièges étaient connus, tous les deux écrits dans le runbook, tous les deux dans le tag `pgbackrest` de Pigsty lui-même :

- **`stanza-create` et la sauvegarde initiale sont en `ignore_errors: true`.** Un PLAY RECAP vert ne prouve strictement rien sur l'un ni sur l'autre.
- **La sauvegarde initiale est gardée par `/etc/pgbackrest/initial.done`**, qui existait déjà depuis le bootstrap d'origine. Le run crée donc un repo vide sur S3 et rapporte un succès : vous êtes migré sans aucune sauvegarde.

Les deux se sont déclenchés, et une troisième chose que j'avais notée comme « à corriger séparément » s'est révélée être l'amplificateur. Ces deux tâches se basent sur le `pg_role` de **l'inventaire**, pas sur le rôle réel. `pigsty.yml` déclare toujours `.205` comme primary ; Patroni a `.207` en leader depuis un moment. Donc `stanza-create` et la sauvegarde initiale ont tourné sur `.205` et ont été skippées sur `.207`.

Résultat net du run : une stanza sans aucune sauvegarde dedans, et un PLAY RECAP entièrement vert. Quelqu'un qui ferait ça sans le runbook repartirait convaincu d'avoir des sauvegardes.

J'ai pris la première sauvegarde complète à la main sur le primary réel, et là les chiffres étaient bons :

| Vérification                     | Résultat                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `repo1-type` sur les deux nœuds  | `s3`, bucket `pg-backup`, path style                                                   |
| Archivage WAL                    | 448 archivés, **0 échec**                                                              |
| Première sauvegarde complète     | `20260826-065830F` — 8,4 Go → 4,1 Go, 14 969 fichiers, 78 s                            |
| Repo réellement partagé          | `.205` lit la sauvegarde prise par `.207`                                              |
| Le réplica peut récupérer du WAL | `archive-get` sur `.205` a récupéré un segment de 16 Mo : _« found … in the archive »_ |
| Cluster                          | `streaming`, lag 0, timeline 31 du début à la fin                                      |

La quatrième ligne est tout l'objet de l'exercice. Une heure plus tôt, elle était structurellement impossible.

## Le piège que personne n'avait prévu

Puis j'ai vérifié le `restore_command`, l'autre moitié du changement, et il était sur `.207` et **absent de `.205`**.

`.205` est le réplica. C'est le seul nœud qui utilise jamais un `restore_command`. Le paramètre avait atterri exclusivement sur celui qui n'en a aucun usage.

J'ai vérifié plutôt que deviné, parce que toutes les explications évidentes étaient fausses :

- Ansible résolvait `pg_parameters` **de façon identique sur les deux hôtes**. Pas un problème de template.
- `postgresql.auto.conf` a été **réécrit sur les deux** — mtime mis à jour de part et d'autre. Pas un problème de « la tâche n'a pas tourné ».
- Et pourtant le fichier du réplica ne contenait que l'en-tête de Pigsty.

Quelque chose a réécrit ce fichier après Pigsty, et sur un standby, ce qui possède les paramètres de recovery, c'est Patroni. `pg_parameters` écrit dans `postgresql.auto.conf` ; Patroni réécrit `postgresql.auto.conf` sur un standby ; Patroni passe en dernier.

**`pg_parameters` n'est pas un endroit fiable pour ce qu'un réplica doit honorer.** Le bon endroit, c'est la config DCS de Patroni :

```bash
patronictl -c /etc/patroni/patroni.yml edit-config pg-proxmox \
  -p "restore_command=pgbackrest --stanza=pg-proxmox archive-get %f %p" --force
```

Ça s'applique à tous les membres, survit aux redémarrages, aux failovers et aux `reinit`, et n'est pas écrasé par le prochain run Pigsty — le bloc `dcs:` du template Pigsty ne s'applique qu'au bootstrap. L'entrée `pg_parameters` reste dans `pigsty.yml` comme chemin de reconstruction from scratch, mais ce n'est pas elle qui gouverne le cluster en marche. Après l'édition, les deux nœuds rapportent le paramètre.

Pourquoi celui-là vaut plus que tout le reste : si je n'avais pas vérifié nœud par nœud, l'ADR aurait été marquée terminée, le runbook marqué suivi, et la fragilité même que tout cet exercice existe pour supprimer serait restée entièrement présente sur le seul nœud qui avait besoin du correctif — avec, en prime, une trace écrite affirmant le contraire.

## Six fausses pistes

Chacune a produit une lecture fausse et confiante. Je les note parce que la prochaine personne à toucher à ça tombera sur le même outillage.

**1. « Les sauvegardes ont disparu. »** L'état pré-migration rapportait `du -sh /pg/backup` → `0` sur les _deux_ nœuds, alors que `pgbackrest info` listait tranquillement de vraies sauvegardes complètes. `/pg/backup` est un **symlink** vers `/data/backups/pg-proxmox-18/backup`, et `du` ne suit pas les symlinks. Les données étaient là depuis le début — 8,6 à 8,7 Go par nœud. Pris au pied de la lettre, ça se lit « les repos locaux sont déjà vides, rien à préserver », juste avant une migration dont toute la stratégie de rollback repose sur l'existence de ces fichiers.

**2. « Garage est injoignable depuis les nœuds pg. »** Le premier test de connectivité annonçait les trois endpoints morts : `/dev/tcp/garage.bnei.lan: No such file or directory`, idem pour les deux autres. `/dev/tcp` est une fonctionnalité **bash**, et `ansible -m shell` utilise `/bin/sh` sur ces hôtes. L'erreur parlait du shell, pas du réseau. Retesté avec `curl`, la réponse était tout autre — `192.168.1.199:3900` et `s3.bnei.dev` renvoyaient `403`, donc joignables. Prendre le premier résultat au sérieux aurait tué l'approche sur un faux négatif. Une conclusion a survécu à la correction : `garage.bnei.lan` ne résout effectivement pas depuis ces nœuds.

**3. « Il suffit de pointer sur l'endpoint LAN. »** Vu plus haut — le driver S3 de pgBackRest 2.58 est TLS-only, le `:3900` de Garage est en HTTP clair.

**4. « Un `restore_command` aurait corrigé l'incident initial. »** C'était le plan de départ, et il était faux pour la raison qui occupe tout le milieu de ce billet.

**5. « Un run non wrappé échouerait, évidemment. »** Il a rapporté SUCCESS.

**6. « `--check` me dira si c'est sûr. »** Non. `--check` échoue sur ces chemins Pigsty et Ansible pour des raisons sans rapport avec la correction : les tâches `command` ne s'exécutent pas en check mode, la sortie enregistrée est donc vide et tous les filtres en aval explosent. Le check mode n'apporte aucune sécurité ici. La sécurité est venue de l'ordre : repo partagé d'abord, vérifier, prendre la sauvegarde à la main, vérifier encore, et ne pas toucher aux repos locaux.

## Ce qui reste non prouvé

Le mécanisme est prouvé : le réplica récupère bien un segment WAL depuis l'archive partagée, en trois secondes environ. Ce qui n'a **pas** été exercé, c'est PostgreSQL déclenchant ce chemin dans les conditions réelles de panne.

Le test qui refermerait ça : arrêter le réplica, pousser le primary au-delà des 18 Go de `max_slot_wal_keep_size` — ce qui demande du travail délibéré, pas de l'attente — redémarrer le réplica, et confirmer qu'il atteint `streaming` sans `reinit`, en guettant `restored log file` dans le log plutôt que la boucle `has already been removed`.

Tant que ça ne passe pas, la décision est _préparée_, pas _implémentée_, et le document le dit dans sa ligne de statut. Les repos locaux pré-migration sont volontairement toujours là, 8,6 Go par nœud, ce qui garde le rollback à un changement de config d'une ligne.

## Ce que j'en retiens

Il n'y a aucune CI sur tout ça. Le workflow de lint de ce repo se déclenche sur `ansible/**` et `gitops/**`, et la config Pigsty n'est ni dans l'un ni dans l'autre — les deux pull requests affichaient « no checks reported on the branch », et deux boucles d'attente de CI ont expiré en attendant des runs qui n'allaient jamais démarrer. Chaque vérification faite ici est une vérification que j'ai choisi de faire.

Ce qui rend la séparation inhabituellement nette, alors autant la dire franchement :

**Tout ce que j'ai vérifié contre le réel en amont a survécu au réel.** L'expression d'alerte, testée en direct dans ses deux formes avant le commit. Les credentials, testés avec une requête signée. Le run non wrappé, réellement lancé non wrappé. Aucun n'a eu besoin d'être corrigé ensuite.

**La seule chose que j'ai raisonnée au lieu de la tester n'a pas survécu.** `pg_parameters` définit un paramètre Postgres, `restore_command` est un paramètre Postgres, donc `pg_parameters` définit `restore_command`. Chaque étape est vraie et la conclusion est fausse, et aucune relecture de la config ne l'aurait montré. Seule la lecture de la valeur, nœud par nœud, sur le cluster en marche.

Le mode de défaillance qui traverse tout ça est le même, six fois de suite : `ignore_errors: true`, `lookup('env')` sur une variable absente, `count()` sur un vecteur vide, `du` sur un symlink, `/dev/tcp` sous `/bin/sh`, et `pg_parameters` qui résout pareil sur deux hôtes et n'atterrit que sur un. **Aucun n'a échoué. Tous ont rapporté un succès.**

Un PLAY RECAP vert est une affirmation d'Ansible sur l'opinion d'Ansible. Ce n'est pas une preuve sur le système.
