---
title: Ukubi STT
description: Speech-to-text GPU en un seul binaire Rust, sur l'unique carte de mon appartement — environ une demi-seconde derrière la voix, et qui refuse de démarrer si le GPU ne fait pas réellement le travail.
date: 2026-09-02
stack: [Rust, gRPC, ONNX Runtime, CUDA, Kubernetes]
gitLink: 'https://github.com/MohammadBnei/ukubi-stt'
writeup: /blog/realtime-speech-to-text-in-rust
---

Un binaire Rust, une seule méthode gRPC. Il prend du PCM 16 kHz brut et renvoie
du texte environ 560 ms derrière la voix, sur une RTX 2070 SUPER épinglée à un
seul node de mon cluster auto-hébergé. Deux de mes applications s'en servent :
`dream-analyst`, où l'on dicte un rêve au lieu de le taper, et la console
`agent-fleet`, où je dicte mes prompts aux agents. Du repo vide aux deux
consumers en production : trois jours.

## La première chose écrite n'était pas le service

C'était une assertion. `parakeet-rs` enregistre l'execution provider CUDA
d'ONNX Runtime avec le provider CPU derrière — donc si CUDA n'arrive pas à
s'initialiser, le modèle se charge quand même, transcrit quand même, et renvoie
un texte parfaitement correct, sans une seule ligne de log qui ressemble à une
erreur. Le binaire lit donc la mémoire
GPU avant le chargement du modèle et après un decode de warmup, et crashe au
démarrage si le chiffre n'a pas bougé.

Elle s'est déclenchée dès la première exécution réelle. `nvidia-smi` répondait
depuis le conteneur, les transcriptions étaient justes, tous les indicateurs
étaient au vert, et tout tournait sur le CPU. Je l'aurais livré comme ça.

C'est la panne contre laquelle tout le design est construit : pas un crash,
mais l'exécution qui renvoie la bonne réponse, dans la bonne forme, par le
mauvais chemin. C'est aussi pour ça que `decode_seconds` est dans le wire
format plutôt que dans une ligne de log côté serveur — le chiffre qui révèle la
panne appartient à chaque appelant.

## Trois modèles, une seule carte

Un modèle batch multilingue, un modèle streaming, et un modèle CTC persan qui
n'avait finalement pas besoin du GPU et tourne sur CPU. La carte est partagée
avec mes jeux : le service tourne en un seul replica, sans HA, et le node
redémarre quand j'ai envie de jouer. Les deux consumers traitent un
transcripteur indisponible comme une fonctionnalité désactivée, pas comme une
panne. Il n'y a pas d'endpoint public : il répond in-cluster, aux appelants qui
ont leur propre token.
