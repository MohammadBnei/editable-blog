---
title: Comment j'ai atteint la Haute Disponibilité
description: Nous nous étions quittés sur une bonne note. Le cluster Kubernetes était en vie. Mais comme tout ingénieur le sait, un système fonctionnel n'est souvent que le…
date: 2025-09-29
---

## Introduction

[Nous nous étions quittés](https://blog.bnei.dev/blog/road-to-self-hosted-kubernetes-cluster) sur une bonne note. Le cluster Kubernetes était en vie. Mais comme tout ingénieur le sait, un système fonctionnel n'est souvent que le prélude au problème suivant, plus intéressant. Bien que le cluster fût techniquement opérationnel, son architecture possédait un talon d'Achille caché : un point de défaillance unique pour tout le trafic entrant.

Ma mission était claire : l'éliminer. L'outil pour ce travail était MetalLB, et la tâche semblait simple. J'avais tort. Ce qui a suivi fut une investigation de plusieurs jours dans un profond et sinueux terrier de problèmes réseau. Voici le dossier de cette enquête — une histoire policière qui commence par des erreurs TLS trompeuses, mène à des blocages réseau fantômes, et se termine par le démasquage d'un coupable enterré dans les fondations mêmes de mes outils de virtualisation. Rejoignez-moi pour résoudre l'affaire du cluster inaccessible.

## Acte 1 : L'objectif initial de la haute disponibilité

- **Le problème :** Mon cluster Kubernetes auto-hébergé avait un point de défaillance unique. Mon routeur ne pouvait acheminer le trafic que vers l'IP d'un seul nœud, ce qui annulait l'intérêt d'une configuration multi-nœuds.
- **La première idée :** Utiliser un Raspberry Pi comme reverse proxy pour distribuer le trafic.
- **L'avis d'expert :** Cela ne fait que déplacer le point de défaillance unique vers le Pi. La solution native à Kubernetes est d'utiliser MetalLB pour fournir un Virtual IP (VIP) unique et hautement disponible.
- **La première correction :** Nous avons corrigé ma configuration MetalLB : déplacé le pool d'adresses IP vers mon sous-réseau LAN principal (`192.168.1.x`) et supprimé le `nodeSelector` pour permettre à n'importe quel nœud de devenir le leader pour le VIP.

## Acte 2 : La phase trompeuse « Ça n'a pas fonctionné »

- **Un nouveau mystère apparaît :** Après avoir appliqué la correction MetalLB, mon service Traefik était toujours bloqué avec son ancienne adresse IP d'un mauvais sous-réseau.
- **La leçon :** Les services Kubernetes ont une « IP stickiness ». MetalLB ne changera pas une IP déjà assignée.
- **La solution :** Nous avons forcé une réallocation en « basculant » temporairement le type de service de `LoadBalancer` à `ClusterIP` et inversement. Cela a réussi à assigner un nouveau VIP correct à Traefik.

## Acte 3 : Le vrai problème refait surface - Le mur d'erreurs

- **Les symptômes :** Avec le VIP correctement assigné, un nouveau problème plus grave est apparu. Toutes les connexions externes échouaient avec une `SSL_ERROR_SYSCALL`, tandis que mes logs Traefik affichaient une énigmatique `local error: tls: bad record MAC`.
- **La première fausse piste :** L'erreur `bad record MAC` suggérait fortement un appareil « man-in-the-middle » corrompant les paquets TLS. Nous avons suspecté un pare-feu trop agressif sur mon routeur ou mon hôte de VMs.
- **L'intrigue s'épaissit :** J'ai confirmé que ce n'était pas mon routeur internet principal, car l'erreur `bad record MAC` se produisait toujours lors de la connexion depuis un autre ordinateur de mon réseau local, prouvant que la corruption du trafic se produisait plus près du cluster. Ensuite, `pinguer` le VIP a révélé un problème encore plus profond : `Destination Host Unreachable`. Nous ne pouvions même pas atteindre l'IP au niveau réseau de base.

## Acte 4 : À la poursuite de fantômes réseau

- **La deuxième fausse piste :** Un hôte « inaccessible » signifie qu'il n'y a pas de réponse ARP. Nous avons émis l'hypothèse que le pare-feu de Cilium bloquait les annonces ARP de MetalLB. Nous avons même rédigé une `CiliumNetworkPolicy` pour autoriser le trafic.
- **L'indice décisif :** La sortie de `arp -a` montrant une entrée ARP **réussie** pour le VIP et les logs montrant que MetalLB _annonçait_ bien le service. L'ARP n'était finalement pas le problème. Le nœud était joignable au niveau Layer 2.
- **L'arme du crime :** L'étape suivante fut un `tcpdump` sur le nœud leader. La capture de paquets a révélé la vérité définitive :
  1.  Le paquet de requête est arrivé correctement sur l'interface `eth1` (mon LAN principal).
  2.  Le paquet de réponse a tenté de partir par une interface entièrement différente, `eth0`.
  3.  Un pare-feu stateful (l'hôte des VMs lui-même) a vu cette réponse non concordante, l'a supprimée et a coupé la connexion.
- **Le diagnostic :** Nous avions trouvé le véritable coupable : **le Routage Asymétrique**.

## Acte 5 : Le coupable final et la solution

- **La dernière preuve :** L'examen de la table `ip route` de ma VM, qui a confirmé le diagnostic. La route par défaut de mon nœud pointait incorrectement vers l'interface `eth0`, un réseau de gestion privé créé par Vagrant.
  ```
  default via 192.168.121.1 dev eth0
  ```
- **La cause profonde :** Il s'agit d'une particularité fondamentale de la conception de Vagrant. Il nécessite un réseau NAT de gestion, qui entre en concurrence avec tout réseau ponté pour la route par défaut, créant le problème de routage asymétrique.
- **Le test :** Nous avons prouvé la solution avec une commande temporaire pour supprimer manuellement la mauvaise route et ajouter la bonne. Cela a fonctionné instantanément.
  ```bash
  sudo ip route del default && sudo ip route add default via 192.168.1.254 dev eth1
  ```
- **La solution permanente :** J'ai codifié cette correction dans mon `Vagrantfile`, en utilisant un `shell provisioner` configuré sur `run: "always"` pour imposer la route par défaut correcte à chaque démarrage.

## Épilogue : L'effet domino

- Avec le routage corrigé, le cluster a enfin pu communiquer avec Internet, ce qui a résolu le tout premier problème que nous avions rencontré : le `ClusterIssuer` défaillant.
- `cert-manager` a désormais pu contacter Let's Encrypt, émettre un certificat valide, et Traefik a commencé à le servir correctement.
- Toutes les erreurs TLS ont disparu, et le cluster était entièrement, correctement et de manière fiable en ligne.

## Leçons apprises

- **Aborder systématiquement les points de défaillance uniques (SPOF) :** Notre parcours a commencé par l'élimination d'un SPOF. La leçon est de toujours rechercher des solutions robustes et architecturalement solides (comme MetalLB natif à Kubernetes) plutôt que de simplement déplacer le SPOF vers un autre composant.

- **Dépannage réseau : Suivre une approche L7-vers-L2 (itérativement) :**
  - **Couche application et service (L7/K8s) :** Commencez par les logs d'application (Traefik), l'état des services et la validité des certificats (`cert-manager`). Confirmez ce que l'application _pense_ qu'il se passe. Vérifiez la configuration spécifique des services Kubernetes (comme `externalTrafficPolicy` ou si un `LoadBalancerIP` est `sticky`).
  - **Politique réseau et pare-feu stateful (L3/L4) :** Vérifiez les politiques CNI (Cilium), les `iptables` de l'hôte et les pare-feu de VM/hyperviseur. Ceux-ci suppriment souvent silencieusement les connexions en fonction de l'état.
  - **Connectivité IP de base (L3) :** Utilisez `ping` pour la joignabilité et `traceroute` pour le chemin. Si `ping` échoue avec "Destination Host Unreachable", vérifiez toujours Layer 2.

- **`arp -a` est crucial pour le diagnostic L2 :** Lorsque `ping` échoue, `arp -a` confirme si l'IP se résout même en une adresse MAC. Une réponse ARP réussie déplace immédiatement l'attention vers le routage ou les problèmes de couche supérieure.

- **`ip route` mappe votre monde :** Si l'ARP fonctionne mais que le trafic échoue toujours, inspectez la table de routage de l'hôte. Les passerelles par défaut mal configurées, les routes concurrentes ou les attributions d'interface incorrectes (`eth0` vs `eth1`) sont des coupables courants du routage asymétrique.

- **`tcpdump` est le sérum de vérité ultime (L2-L7) :** Lorsque les logs sont trompeurs et que les `ping` ne racontent pas toute l'histoire, `tcpdump` révèle précisément quels paquets arrivent, partent et sont supprimés. Ce fut l'outil définitif qui a exposé le routage asymétrique.

- **Connaissez les particularités cachées de vos outils :** Comprenez les comportements par défaut de vos outils d'infrastructure. Le réseau de gestion automatique de Vagrant (`eth0`) créant une route par défaut concurrente a été l'antagoniste caché de notre parcours de débogage.

- **Faites confiance, mais vérifiez, toujours :** Ne partez pas du principe que. Ne partez pas du principe qu'une IP `LoadBalancer` changera automatiquement. Ne partez pas du principe que votre routeur n'interfère pas. Ne partez pas du principe qu'un échec de `ping` signifie que l'ARP est cassé. Testez et obtenez des données concrètes pour chaque hypothèse.

---

_Ce post a été traduit par un agent IA._
