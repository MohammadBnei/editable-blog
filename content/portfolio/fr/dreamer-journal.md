---
title: Journal du rêveur
description: Un journal de rêves qui interprète ce que vous écrivez — dictée ou texte en entrée, plusieurs écoles d'interprétation en sortie, avec un système de crédits pour que la facture reste finie.
date: 2026-07-13
stack: [SvelteKit, LLM, Web Speech API, Kubernetes]
gitLink: 'https://github.com/MohammadBnei/dream-analyst'
liveLink: 'https://dreamer.bnei.dev'
---

Une application de journal de rêves, construite avec SvelteKit, où la saisie
n'est que la moitié du sujet — l'autre moitié est ce qu'un modèle de langage
en fait.

## Ce qu'elle fait

On enregistre un rêve en le tapant ou en le dictant, via la reconnaissance
vocale du navigateur, parce que le moment réaliste pour faire cela se situe
trente secondes après le réveil et que taper est déjà trop demander.

Le modèle renvoie ensuite une interprétation et une liste de symboles.
L'interprétation n'est pas unique : on choisit le cadre d'analyse. Jungien,
pour les archétypes et l'ombre. Freudien, pour le refoulé et le conflit. Un
résumé simple, quand on ne veut que les thèmes. Ou une lecture islamique,
ancrée dans l'herméneutique propre à cette tradition.

À partir de là, c'est une conversation — on peut questionner l'interprétation,
insister sur un symbole, ou demander ce que le modèle ferait du même rêve
raconté autrement.

Les entrées sont chiffrées et indexées par date, pour que l'archive vaille
quelque chose au bout de plusieurs mois plutôt que d'être une curiosité qui
survit une semaine.

## La partie ingrate

Un système de crédits. Chaque analyse et chaque tour de conversation coûte un
appel au modèle, et un projet personnel à la facture non plafonnée finit par
être éteint. Les utilisateurs ont un quota quotidien ; le coût
d'exploitation reste borné, ce qui est la seule raison pour laquelle
l'application tourne encore.
