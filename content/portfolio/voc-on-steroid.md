---
title: Voc On Steroid
gitLink: null
liveLink: 'https://voconsteroid.com'
---

## Vocabulary‑Learning Platform

_Full‑stack Go monolith (Clean Architecture)_
---

A web application that lets users discover, organise, and master new words through instant search, contextual examples, spaced‑repetition, and gamified challenges. The codebase is deliberately structured for long‑term testability and maintainability, and it runs on a production‑grade Kubernetes platform that I also built and operate.

### Technical Strengths

| Category                 | Details                                                                                                                                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language & Framework** | **Go** + **Gin** for HTTP routing, **gqlgen** for a **GraphQL** API (`/graphql`).                                                                                                                                                                  |
| **Architecture**         | Clean Architecture (Domain ↔ Application ↔ Infrastructure). Business rules live in `internal/domain`; use‑case orchestration and CQRS handlers in `internal/application`; external adapters (PostgreSQL, Redis, JWT) in `internal/infrastructure`. |
| **CQRS & Event Bus**     | In‑memory bus powered by **go‑dew** – commands (e.g., `CreateWordListCommand`) mutate state, queries (e.g., `GetWordListQuery`) read data.                                                                                                         |
| **Persistence**          | **PostgreSQL** via **GORM** for relational data; **Redis** for caching / session storage.                                                                                                                                                          |
| **Generic Repository**   | `generic.Repository[T,F]` defines CRUD; `GormGenericRepository` provides type‑safe implementations for all domain entities.                                                                                                                        |
| **Dependency Injection** | Compile‑time wiring with **Google Wire**, making services easily replaceable in tests.                                                                                                                                                             |
| **Authentication**       | **JWT** – short‑lived access token stored in an HTTP‑only cookie; long‑lived refresh token stored in the DB. Gin middleware extracts the token and injects `userID` into the request context.                                                      |
| **Logging**              | Structured logging with **Zerolog** (JSON output, request IDs).                                                                                                                                                                                    |
| **Testing**              | Unit & integration tests using **GoMock**, table‑driven test patterns, and in‑memory repositories for fast CI execution.                                                                                                                           |
| **Observability**        | Metrics exported via **Prometheus**, traces via **OpenTelemetry**, and logs aggregated in a cluster‑wide stack (Prometheus + Grafana + Loki + Jaeger).                                                                                             |
| **Deployment Platform**  | Runs on a self‑managed 3‑node HA **Kubernetes** cluster (MetalLB, Cilium CNI) with a **GitOps** workflow powered by **Argo CD**. Deployment time dropped from 1–2 h to < 10 min and failure rate reduced from ~40 % to < 5 %.                      |

### User‑Facing Core Features

1. **Instant Word Search** – definitions, etymology, phonetic transcription, and audio playback; toggle between simple and detailed views.
2. **Custom Lists & Tagging** – one‑click saving into user‑defined collections (e.g., _Philosophy Terms_) with label‑based tags for targeted review.
3. **Contextual Examples** – literature, news, film excerpts, and community‑submitted quotes, filterable by genre or culture.
4. **Gamified Daily Challenges** – adaptive quizzes (definition guess, fill‑in‑the‑blank, synonym matching) that award badges and update mastery graphs.
5. **Spaced‑Repetition Engine** – automated review reminders at optimal intervals; users can override schedules for intensive training.

### Operational Flow

1. **Request → Gin Router** – Incoming HTTP (or GraphQL) request passes through JWT middleware.
2. **Resolver → go‑dew Bus** – Light GraphQL resolvers validate input and publish a command or query onto the in‑memory bus.
3. **Handler → Domain Logic** – Appropriate handler executes business rules in the `application` layer, invoking generic repositories as needed.
4. **Infrastructure → DB / Cache** – GORM reads/writes PostgreSQL; Redis serves cached lookups and session data.
5. **Observability Hooks** – Custom OpenTelemetry spans and Prometheus counters are emitted for each command/query, feeding the cluster‑wide monitoring stack.

**Why it matters** – The project demonstrates end‑to‑end mastery of modern Go engineering (clean architecture, CQRS, DI), production‑grade Kubernetes operations (GitOps, observability, rapid deployments), and a user‑centric product that turns vocabulary learning into an engaging, data‑driven experience.
