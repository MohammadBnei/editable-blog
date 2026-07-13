---
title: Editable blog
gitLink: 'https://github.com/MohammadBnei/editable-blog'
liveLink: 'https://blog.bnei.dev/'
---

## **A Lightweight, Self‑Hosted, Multilingual CMS**

---

### 1. The Problem

I wanted a personal publishing platform that would let me write a post once, have it automatically translated, share it on LinkedIn, and schedule the publication – all without juggling multiple tools or a heavyweight CMS. The solution had to run on my own Kubernetes node, be fast for visitors, and keep the editorial workflow friction‑less.

### 2. Core Architecture

| Component                    | Choice & Rationale                                                                                                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend / rendering**     | **SvelteKit** with Server‑Side Rendering (SSR). Because most pages are static, SSR delivers sub‑second first‑byte times without a separate build step.                                                                                                         |
| **Database**                 | **PostgreSQL** – stores markdown content, inline images/PDFs (as BLOBs), version metadata and LinkedIn post settings.                                                                                                                                          |
| **Automation / translation** | **n8n** workflows triggered from the UI. A post is sent to n8n, which calls a translation service, stores the localized versions, and queues a LinkedIn payload.                                                                                               |
| **Containerisation**         | **Docker** images built per commit; the image includes the SvelteKit app and the n8n runner.                                                                                                                                                                   |
| **Orchestration**            | **Kubernetes** with **Kustomize** overlays for dev / prod environments. The cluster is the same one I already operate for other side‑projects (see my personal cloud platform) .                                                                               |
| **CI/CD**                    | **GitHub Actions** + **release‑it**. A push to `main` runs lint, unit tests, creates a new semantic version, builds the Docker image and updates the Kustomize `kustomization.yaml`. Argo CD (or a `kubectl apply`) then rolls the new release to the cluster. |
| **Versioning**               | Within the app each article has a `version` field (draft → review → published). The overall app version is bumped automatically by **release‑it** during the CI run.                                                                                           |
| **Scheduling**               | A cron‑job inside the cluster calls the n8n endpoint every 48 h, publishing any queued LinkedIn posts.                                                                                                                                                         |
| **Image/PDF handling**       | Uploaded files are streamed directly into PostgreSQL, avoiding an external object store and keeping the deployment truly self‑hosted.                                                                                                                          |
| **Trivia / image scanning**  | A small Go service (outside the scope of the blog) watches the uploaded assets and runs a quick scan for prohibited content – a proof‑of‑concept for future moderation.                                                                                        |

### 3. How Automation Reduces Friction

1. **Write → Translate** – After saving a draft, the UI calls `/api/translate`. n8n fetches the markdown, sends it to a translation API, and writes back the localized copies.
2. **Translate → LinkedIn** – The same workflow creates a LinkedIn payload (title, excerpt, image URL) and stores it in the DB.
3. **Cron → Publish** – Every two days a Kubernetes `CronJob` triggers the n8n “post to LinkedIn” workflow, pulling any ready payloads and sending them to LinkedIn’s API.

All steps happen with a single button click in the admin UI; no manual copy‑pasting or external script execution is required.

### 4. Performance & Reliability

- **SSR speed** – Because the majority of content is static markdown, the SvelteKit server returns HTML in < 200 ms for typical pages (no client‑side hydration lag).
- **Zero‑downtime deployments** – The CI pipeline builds a new image, updates the Kustomize manifest, and Argo CD (or `kubectl rollout`) performs a rolling update. My existing GitOps workflow on the same cluster cuts deployment time from hours to minutes.
- **Self‑contained storage** – Images and PDFs live in PostgreSQL, eliminating network latency to an external bucket and simplifying backups.

### 5. Challenges & Solutions

| Challenge                                                                | Solution                                                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Concurrent edits** – Two editors could modify the same article.        | Added an optimistic‑locking `version` field; the UI warns the user if the DB version changed since they loaded the draft.                   |
| **Large media uploads** – Storing PDFs in PostgreSQL could bloat the DB. | Implemented streaming inserts and set a 5 MB size limit per file; larger assets are rejected with a clear UI message.                       |
| **Translation latency** – External translation APIs can be slow.         | n8n runs the translation asynchronously; the UI displays a “translation in progress” badge and updates automatically when the job finishes. |

### 6. Current Status & Next Steps

- The prototype is fully functional on my personal Kubernetes cluster (Docker, K8s, Kustomize).
- No production‑grade metrics yet, but early testing shows the end‑to‑end publish flow completes in under 30 seconds.
- **Future work**: add analytics (page‑view counters), implement image‑optimisation pipelines, and expose a public demo for community feedback.

### 7. Why This Project Matters to Recruiters & Tech Leads

- **End‑to‑end cloud‑native delivery** – From source to running pod, whole stack (Docker → Kustomize → CI/CD) is automated, mirroring enterprise GitOps practices [1].
- **Multilingual & workflow automation** – Shows ability to integrate SaaS APIs (translation, LinkedIn) via n8n, a skill in high demand for modern content pipelines.
- **Performance‑first design** – SSR with SvelteKit delivers fast page loads without a separate static site generator, demonstrating practical front‑end optimisation.
- **Self‑hosting mindset** – Keeps everything in‑house (PostgreSQL storage, Kubernetes cluster), aligning with security‑first organisations.
