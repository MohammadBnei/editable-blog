---
title: Remplacer mes clés SSH par un login
description: Un agent IA a traduit le texte depuis l'anglais. Chaque machine de mon homelab avait sa propre clé, à récupérer dans un gestionnaire de secrets avant de pouvoir y toucher. Mieux gérer ces clés n'aurait rien réglé. J'ai sorti l'identité du fichier de clé pour la mettre dans le login que j'avais déjà, et j'ai gardé les anciennes clés comme porte de secours.
date: 2026-10-11
---

## Introduction

Cet après-midi, j'ai voulu me connecter au témoin etcd, une petite VM dont le seul rôle est de garder honnête le quorum de mon cluster Postgres. La clé qu'utilisent les playbooks Postgres a été refusée. Celle des VMs Kubernetes aussi. Celle qui a marché, c'était une troisième, `id_pg_etcd_witness`, que Terraform avait générée pour cette seule machine il y a des mois et dont j'avais oublié l'existence.

Tout le problème tient dans cette machine. Mon `~/.ssh` contient une clé par serveur : une pour les VMs Kubernetes, une pour le témoin, une pour le build runner, une pour le conteneur de stockage, une pour le serveur NFS, une pour la machine d'ops, une pour le Raspberry Pi. Celles qui ne sont pas sur mon laptop sont dans Infisical, et chaque playbook qui y touche commence par écrire une clé dans un fichier temporaire, puis passe `-e ansible_ssh_private_key_file=` en ligne de commande. Le matin même, une session de debug était restée bloquée un bon moment, simplement pour trouver un moyen d'entrer sur un des hôtes Proxmox.

La solution évidente, c'est de mieux gérer les clés : une seule clé partout, une autorité de certification à courte durée, un script qui va chercher la bonne. Chacune de ces options garde l'erreur de fond : _la clé est l'identité_. Celui qui a le fichier, c'est moi, sur cette machine, tant que le fichier existe.

J'ai plutôt déplacé l'identité là où je la maintiens déjà. Chaque session SSH vers une machine commence maintenant par un login dans le navigateur, sur authentik, l'identity provider que le reste du cluster utilise déjà, et la machine décide quel utilisateur je peux devenir selon le groupe auquel j'appartiens. Il n'y a pas de nouveau secret à stocker, parce qu'il n'y a pas de clé.

## La décision qu'il a d'abord fallu revoir

Quand j'ai reconstruit ce cluster, j'ai écrit ce que je ne ferais pas, et une de ces décisions disait : pas de Wireguard ni de Tailscale. Un VPN mesh comme porte d'entrée du cluster, c'était à l'époque une pièce mobile dont je n'avais pas besoin.

Ce que je voulais maintenant, c'était justement un mesh. NetBird, que je venais de déployer pour relier deux laptops et un Raspberry Pi, embarque un serveur SSH dans son client. Le client authentifie chaque connexion avec un token issu du même login que celui du dashboard, et associe des groupes à des utilisateurs locaux. Ça ne marche que si les machines elles-mêmes rejoignent le mesh.

Il fallait donc revenir sur ce « non », et le plus utile a été d'écrire à quel point on y revenait peu. Les machines deviennent des peers pour SSH, et rien d'autre. Pas de route vers le LAN, pas d'exit node, pas de pod sur le mesh, pas de trafic Kubernetes dessus. Les inventaires Kubernetes et Postgres pointent toujours sur les adresses du LAN et ne changent pas. Les gros traitements — une mise à jour complète de Kubernetes, une reconfiguration de Postgres, tout ce qui redémarre un nœud — partent toujours de la machine d'ops, sur le LAN : un mesh qui tombe en plein changement etcd, c'est une bien pire journée qu'un login un peu lent.

```mermaid
flowchart LR
  subgraph before ["Avant"]
    L1["Laptop"] -->|"une clé par machine, depuis Infisical"| H1["Chaque machine"]
    I1["Internet"] -->|"port SSH root redirigé"| B1["Machine d'ops"]
    B1 -->|"encore des clés"| H1
  end
  subgraph after ["Après"]
    L2["Laptop"] -->|"NetBird SSH, login navigateur"| H2["Chaque machine (peer)"]
    A2["authentik"] -.->|"qui je suis, quel groupe"| H2
    O2["Machine d'ops sur le LAN"] -->|"gros traitements, inchangés"| H2
    L2 -.->|"clé LAN, break-glass"| H2
  end
```

Les anciennes clés restent. Sur le LAN, elles sont la porte de secours si NetBird ou authentik tombe. Depuis l'extérieur, une fois le cutover fait, une seule clé break-glass sera acceptée, via la machine d'ops. Le nouveau chemin n'a pas le droit d'être le seul tant qu'il n'a pas échoué au moins une fois devant moi.

## Une configuration que je peux aussi cliquer

Les réglages de NetBird vivent dans sa base de données, pas dans un fichier que je peux committer : groupes, policies, setup keys, quel peer peut faire du SSH vers où. Je les voulais dans git, sans pour autant renoncer au dashboard, qui reste le moyen le plus rapide de voir ce que le mesh croit être vrai.

Ces deux envies se battent, sauf si l'une des deux sait qu'elle n'est pas aux commandes. Le playbook qui déclare le compte via l'API REST de NetBird a deux modes. Par défaut, il ne fait que _créer_ ce qui manque ; pour tout le reste, il compare et signale : « cette policy diffère du fichier, laissée telle quelle ». Ce n'est qu'avec un `-e netbird_enforce=true` explicite qu'il réécrit ses propres valeurs, et seulement sur les champs qu'il nomme. Ce qu'il ne nomme pas, il ne l'écrit jamais. Un changement fait dans le dashboard tient jusqu'à ce que je décide que le fichier doit gagner, et le run suivant me le signale.

Ce partage a servi dans l'heure. Pour avoir accès pendant que je déboguais, j'avais ajouté le groupe des machines à mon propre utilisateur dans le dashboard. NetBird propage les groupes d'un utilisateur à ses appareils : mon laptop est donc discrètement devenu une « machine d'infra », et le run suivant en mode enforce a activé son serveur SSH, puisque c'est ce que le playbook fait aux machines d'infra. Sans conséquence — la seule machine autorisée à s'y connecter était le laptop lui-même — mais la leçon est claire : appartenir au groupe ne prouve pas qu'on est une machine. Les machines s'enrôlent avec une setup key et n'appartiennent à aucun utilisateur. Le playbook n'agit plus que sur celles-là, et signale comme drift tout appareil d'un utilisateur qui se retrouve dans le groupe des machines.

## Le check qui ne me voyait pas

Le premier design avait un contrôle de plus : un posture check qui n'autorisait un laptop à joindre les machines que s'il était géolocalisé en France. Il ne coûtait rien à ajouter et ressemblait à un second mur bon marché.

Au premier test depuis chez moi, mon laptop ne voyait aucune machine. Le serveur NetBird juge la localisation d'après l'adresse d'où vient la connexion, et chez moi, mon laptop joint le serveur — qui tourne dans mon propre cluster — via le NAT hairpin de la box. Pour le serveur, j'étais `192.168.1.254`, la box elle-même, sans aucun pays. Le check ne pouvait jamais passer depuis l'endroit où je m'en sers le plus.

Aucune correction ne gardait le check honnête. Une seconde policy autorisant mon sous-réseau aurait laissé entrer n'importe qui sur n'importe quel réseau en `192.168.1.0/24`, l'un des réglages par défaut les plus courants des box. Le check géographique a donc disparu, et l'accès repose sur ce qui faisait déjà le vrai travail : un login par session, et l'appartenance au groupe des admins. C'est exactement le rôle du spike. Mieux vaut découvrir un contrôle aveugle sur trois machines de test que dans un train.

## Où on en est

Trois machines sont enrôlées : le témoin etcd, un worker Kubernetes, et le build runner, un conteneur qui avait besoin que son hôte Proxmox lui passe `/dev/net/tun` avant que le client accepte de démarrer. L'enrôlement est lui-même un playbook — repo de paquets, version du client figée et protégée des mises à jour automatiques, `netbird up` avec une setup key lue depuis un fichier supprimé ensuite — parce que tout l'intérêt était d'arrêter de faire des choses à la main sur les machines.

`ssh root@k8s-worker-02.bnei.mesh` ouvre un onglet dans le navigateur, je me connecte, et je suis sur la machine. Pas de fichier de clé, rien à récupérer avant.

Pas encore fait, et pas revendiqué : Ansible via le mesh, et combien de logins navigateur un run de playbook coûte vraiment ; ce qui arrive aux sessions ouvertes quand le serveur NetBird redémarre ; le reste des machines, enrôlées par étapes, avec le leader Postgres et les machines de stockage en dernier ; et le cutover qui réduira enfin les anciennes clés au rôle de break-glass. Les clés sont toujours sur mon laptop. Pour la première fois, je n'en ai pas besoin pour travailler.
