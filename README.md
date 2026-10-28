# My Personal Editable Blog

A fully static personal site and blog, built with SvelteKit and prerendered
to plain HTML at build time. There's no database and no admin login; a small
Bun file server (`server.js`) only serves the prebuilt files. Publishing
content means committing a markdown file.

Check out the blog at [blog.bnei.dev](https://blog.bnei.dev).

This site supports:

- **Bilingual blog posts**: English posts under `content/blog/`, French
  translations under `content/blog/fr/`.
- **Portfolio**: one markdown file per project under `content/portfolio/`.
- **Static pages**: resume and portfolio intro text under `content/pages/`.
- **RSS feed, sitemap, and robots.txt**, generated at build time.

## But why?

It's a static website, so it's fast, cheap to host, and has zero attack
surface — no login, no database to back up or get breached. Content lives
in git, so every edit is versioned and reviewable like code.

## Requirements

- [Bun](https://bun.sh)

That's it — no Postgres, no Node server, no external services.

## Development setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/MohammadBnei/editable-blog.git
cd editable-blog
bun install
```

Start a dev server:

```bash
bun run dev
```

Build a production version (prerenders every route to `build/`, then
generates `sitemap.xml`/`robots.txt`/`rss.xml`):

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

## Publishing content

There's no editor UI — add a markdown file and commit it:

- **Blog post (English)**: `content/blog/<slug>.md`, served at `/blog/<slug>`.
- **Blog post (French)**: `content/blog/fr/<slug>.md`, served at
  `/blog/fr/<slug>` — use the same filename as the English post to link the
  two as translations.
- **Portfolio project**: `content/portfolio/<slug>.md`, served at
  `/portfolio/<slug>`.
- **Static page**: `content/pages/<slug>.md` (e.g. `resume.md`).

Frontmatter is plain YAML (via `gray-matter`); see existing files under
`content/` for the exact fields each content type expects.

## Deployment

- **Docker**: `Dockerfile` runs `bun run build` and serves the static
  `build/` output with `server.js`, a zero-dependency Bun file server.
- **CI/CD**: on every push to `main`, `.github/workflows/release.yml` runs
  the checks, cuts a release with release-it, builds and pushes the image to
  the in-cluster registry, then bumps `image.tag` in `helm/values.yaml`.
- **GitOps**: Argo CD renders `helm/values.yaml` through infra-bootstrap's
  `common-app-chart` and syncs the deployed state to match git.
