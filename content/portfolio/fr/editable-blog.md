---
title: Blog éditable
description: Ce site. Un blog statique bilingue sans base de données ni interface d'administration — publier, c'est un fichier markdown dans un commit, et tout est prérendu en HTML plat.
date: 2026-08-14
stack: [SvelteKit, Bun, Tailwind CSS, daisyUI, Kubernetes, Argo CD]
gitLink: 'https://github.com/MohammadBnei/editable-blog'
liveLink: 'https://blog.bnei.dev/'
---

Le site que vous êtes en train de lire. Il a commencé comme un petit CMS —
Postgres pour le contenu, n8n pour la traduction et la publication sociale, un
éditeur derrière un login — et il n'a plus rien de tout cela.

## Pourquoi il a perdu la majeure partie de son architecture

L'éditeur était le problème. Chacune de ses fonctionnalités supposait que je
voudrais écrire dans une zone de texte d'un navigateur, et je ne l'ai pas fait
une seule fois. J'écris dans mon éditeur, dans le dépôt, à côté du reste. La
base stockait donc du markdown né sous forme de fichier, le login protégeait
un éditeur que personne n'ouvrait, et le workflow de traduction était une file
d'attente pour un travail que je faisais à la main de toute façon.

Tout est parti. Ce qui l'a remplacé est un répertoire :

```
content/blog/<slug>.md        → /blog/<slug>
content/blog/fr/<slug>.md     → /blog/fr/<slug>
content/portfolio/<slug>.md   → /portfolio/<slug>
```

Le chemin d'un fichier est sa route. Le frontmatter est ses métadonnées.
Publier, c'est un commit.

## Ce qu'il est aujourd'hui

SvelteKit avec l'adaptateur statique, qui prérend chaque route à la
compilation. Aucun rendu serveur à l'exécution, aucune base de données, et
rien où se connecter. Le build produit du HTML plat, servi par cinquante
lignes de Bun — qui ont remplacé un paquet npm serviable au point de renvoyer
`index.html` pour les chemins inconnus, cassant ainsi silencieusement la sonde
de santé Kubernetes.

Bilingue par convention de répertoire plutôt que par framework : les articles
français vivent sous `fr/`, partagent leur slug avec leur jumeau anglais, et
le sélecteur de langue navigue entre les deux ou dit simplement que la
traduction n'existe pas encore.

Le design est une tension entre deux polices — mono pour tout ce qui est code,
métadonnée ou étiquette, serif pour tout ce qui se lit vraiment — avec une
seule couleur d'accent, et jamais une seconde.

## Livraison

GitHub Actions construit l'image à la fusion, le tag est mis à jour dans les
manifestes, et Argo CD déploie sur mon propre cluster. Les images viennent
d'un registre interne au cluster plutôt que d'un registre public : un
déploiement ne dépend pas du quota de quelqu'un d'autre.
