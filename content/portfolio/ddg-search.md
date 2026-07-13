---
title: DDG Search
gitLink: 'https://github.com/MohammadBnei/ddg-search'
liveLink: 'https://api.bnei.dev/ddg-search/swagger/index.html'
---

### **From Go Code to GitOps: A Deep Dive into the `ddg-search` API**

---

For a portfolio, a project must demonstrate more than just the ability to write code; it must showcase a complete, end‑to‑end engineering solution. That was my goal with **`ddg-search`**: a simple yet full‑featured API, designed, built, and automated to production‑grade standards. This article details its key features and the DevOps engine that brings it to life.

![](https://blog.bnei.dev/assets/images/n1bm9Y877sMNmDOpwO0ac.webp)

#### **Core API Features and Professional‑grade Characteristics**

`ddg-search` is a lightweight REST API that acts as a proxy for DuckDuckGo search requests. Beyond this basic function, it is architected with the hallmarks of a modern production‑ready service:

1. **OpenAPI Specification** – The API is fully documented via OpenAPI (Swagger), providing clear, interactive documentation for any consumer and establishing a professional contract for its use.
2. **Unique Feature** – A query parameter `?scrape=true` extends the API’s utility, allowing it to convert search results directly into a clean Markdown document.
3. **Built‑in Security & Control** – The service is not publicly open; by default it includes essential security features:
   - **Authentication** – The endpoint is protected by basic authentication.
   - **Rate Limiting** – Configurable request throttling prevents abuse.
4. **Observability** – All requests pass through middleware that emits structured JSON logs, capturing status, latency, and request path so the API’s behavior is immediately observable.

#### **The DevOps Engine: From Commit to Cluster**

A modern API is inseparable from the automation that runs it. `ddg-search` follows a complete GitOps lifecycle, where the Git repository is the single source of truth for the entire system.

1. **Containerisation** – The application is packaged with a multi‑stage `Dockerfile`, producing a minimal, secure image that contains only the compiled Go binary.
2. **Native Kubernetes Deployment** – Deployment manifests are managed declaratively with **Kustomize**, cleanly separating base configuration from environment‑specific overlays, making deployments predictable and repeatable.
3. **Continuous Integration (CI)** – A robust **GitHub Actions** pipeline automates the entire pre‑deployment process on every merge to `main`:
   - Linting and tests to ensure code quality.
   - Semantic versioning derived from commit messages.
   - Automatic generation of `CHANGELOG.md`.
   - Build and push of a version‑tagged Docker image to a container registry.
4. **Continuous Deployment (CD) with GitOps** – The loop is closed with **Argo CD**. An Argo CD _Application_ watches the `ddg-search` repo; when CI pushes a new manifest (with a new image tag), Argo CD detects the change and automatically synchronises the Kubernetes deployment to match the state defined in Git.

#### **Conclusion – A Full‑stack Engineering Showcase**

`ddg-search` is a practical demonstration of a complete software product. It combines a clean, well‑documented API with a mature, fully automated CI/CD pipeline, providing a reproducible process for delivering reliable software.
