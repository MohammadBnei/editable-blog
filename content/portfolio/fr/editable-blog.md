---
title: Blog éditable
description: Ce site. Un blog statique bilingue sans base de données ni interface d'administration — publier, c'est un fichier markdown dans un commit, et tout est prérendu en HTML plat.
date: 2026-08-14
stack: [SvelteKit, Bun, Tailwind CSS, daisyUI, Kubernetes, Argo CD]
gitLink: 'https://github.com/MohammadBnei/editable-blog'
liveLink: 'https://blog.bnei.dev/'
---

Le site que vous êtes en train de lire. Il a commencé comme un petit CMS —
Postgres pour le contenu, n8n pour la traduction et la publication sur les
réseaux sociaux, un éditeur derrière une authentification — et il n'a plus
rien de tout cela.

## Pourquoi il a perdu la majeure partie de son architecture

L'éditeur était le problème. Chacune de ses fonctionnalités supposait que
j'écrirais dans un champ de texte du navigateur, ce que je n'ai jamais fait.
J'écris dans mon éditeur, dans le dépôt, à côté du reste du code. La base
stockait donc du markdown qui existait déjà sous forme de fichier,
l'authentification protégeait un éditeur que personne n'ouvrait, et le
workflow de traduction était une file d'attente pour un travail que je faisais
à la main de toute façon.

Tout cela a été supprimé et remplacé par une arborescence de fichiers :

```
content/blog/<slug>.md        → /blog/<slug>
content/blog/fr/<slug>.md     → /blog/fr/<slug>
content/portfolio/<slug>.md   → /portfolio/<slug>
```

Le chemin d'un fichier est sa route. Le frontmatter est ses métadonnées.
Publier, c'est un commit.

## Ce qu'il est aujourd'hui

SvelteKit avec l'adaptateur statique, qui prérend chaque route à la
compilation. Aucun rendu serveur à l'exécution, aucune base de données, aucune
authentification. Le build produit du HTML statique, servi par cinquante
lignes de Bun. Ces cinquante lignes ont remplacé un paquet npm qui renvoyait
`index.html` pour tout chemin inconnu, ce qui cassait silencieusement la sonde
de santé Kubernetes.

Le bilinguisme repose sur une convention de répertoires, pas sur un
framework : les articles français vivent sous `fr/`, partagent leur slug avec
leur équivalent anglais, et le sélecteur de langue navigue de l'un à l'autre
ou indique que la traduction n'existe pas encore.

Le design tient en deux polices — mono pour le code, les métadonnées et les
étiquettes, serif pour le texte qui se lit en continu — et une seule couleur
d'accent.

## Livraison

GitHub Actions construit l'image à la fusion de la pull request, le tag est
mis à jour dans les manifestes, et Argo CD déploie sur mon propre cluster. Les
images viennent d'un registre interne au cluster : un déploiement ne dépend
pas des limites de débit d'un registre public.
