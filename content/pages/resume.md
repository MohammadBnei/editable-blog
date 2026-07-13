---
title: Resume
download: null
---

# Go & Platform Engineer

**France** | [mohammad@bnei.dev](mailto:mohammad@bnei.dev) | +33 6 61 93 90 82  
[LinkedIn](https://linkedin.com/in/mbnei) | [GitHub](https://github.com/MohammadBnei) | [Portfolio](https://blog.bnei.dev)

---

## Technical Skills

- **Programming Languages:** Golang, Python, TypeScript, Node.js, Bash
- **Backend & Data:** RESTful APIs, gRPC, GraphQL, Microservices, Redis, MongoDB, PostgreSQL, Elasticsearch
- **Cloud & Containerization:** AWS (Lambda, ECS, EKS, S3, IAM, CloudWatch), Kubernetes, Docker, Helm
- **CI/CD & DevOps:** GitLab CI, GitHub Actions, Terraform, ArgoCD, GitOps
- **Observability:** Prometheus, Grafana, Loki, Jaeger, OpenTelemetry
- **Tools & Methodologies:** Git, Agile, TDD, DDD, Unit/Integration Testing

---

## Professional Profile

Backend Engineer who evolved from full-stack development to building autonomous, production-grade platforms. Combines hands-on Go expertise with a deep passion for cloud-native infrastructure, evidenced by architecting and operating a self-hosted, GitOps-driven Kubernetes platform that powers my own products. My journey is about shifting from building features to creating "Golden Paths" that empower developers and reduce operational friction.

---

_(Active Development: 2025 – Present)_  
_This portfolio represents my continuous investment in deep technical learning and product development, undertaken alongside and following my professional engagements._

## Platform Engineering & Product Portfolio

### **Personal Cloud Platform – Production Infrastructure**

_Self-operated, high-availability Kubernetes cluster built on legacy hardware, serving as the foundation for all personal projects._

- **Architecture:** Provisioned a 3-node HA control plane with 3 etcd replicas using KVM/libvirt and automated with Kubespray & Vagrant for repeatable builds.
- **Networking & Load Balancing:** Implemented MetalLB (L2) for stable external IPs and Cilium as the CNI. Configured Traefik with IngressRoute CRDs for flexible routing.
- **GitOps & Automation:** Established an ArgoCD-driven GitOps workflow, cutting average deployment time from **1-2 hours to under 10 minutes** and reducing failure rates from **~40% to <5%**.
- **Philosophy:** Built for deep operational learning, data sovereignty, and to decentralize infrastructure control—owning the stack from hardware to application.

### **Voc On Steroid – Vocabulary Learning Platform**

_Full-stack Go application (Clean Architecture, CQRS) built to transform vocabulary acquisition from memorization to contextual mastery, deployed to the self-hosted kuberentes cluster._

- **Technical Stack:** Go (Gin, gqlgen/GraphQL), PostgreSQL (GORM), Redis, Docker. Implements Domain-Driven Design with dependency injection via Wire.
- **Core Product Features:** Instant word search with definitions, custom word lists with tagging, gamified daily challenges, and a spaced-repetition engine for retention.
- **Deployment & Observability:** Runs on the self-hosted K8s platform. Features full observability with Prometheus metrics, OpenTelemetry traces, and structured Zerolog logging.
- **Vision:** To unlock human potential by making vocabulary learning a journey of discovery and reasoning, bridging language and culture.

### **Dreamer Journal – AI-Powered Dream Analysis**

_SvelteKit application that provides AI-driven interpretation and analysis of dream narratives, deployed to the self-hosted kuberentes cluster._

- **Features:** Speech-to-Text dream logging, multi-paradigm AI analysis (Jungian, Freudian, etc.), interactive AI dialogue.
- **Infrastructure:** Implements a credit-based system to manage AI resource usage, and automatic semantic interconnection between dreams.

### **Additional Technical Projects**

- **Go AI CLI:** A versatile CLI tool built with Charm Bubble Tea for interacting with AI models (text, speech, image) from the terminal.
- **Deployment Monitor Operator:** A Kubernetes Operator (built with Kubebuilder) that proactively monitors Deployment changes and sends email alerts.
- **DDG Search API:** A production-ready Go API proxy for DuckDuckGo with OpenAPI specs, authentication, rate-limiting, and a full GitOps CI/CD pipeline.

<div style="page-break-after: always;"></div>

---

## Professional Experience

### **Freelance Go & Platform Consultant** | _Mar 2024 – Present_

**Client Engagement: PerfectStay** (Aug 2024 – Mar 2025)

- **Idempotent Data Ingestion:** Engineered a resilient Go pipeline (AWS Lambda, ECS Fargate, SQS) to process **millions of CSV rows** for hotel discovery, idempotent, and replacing manual data entry.
- **Internal Monitoring Product:** Developed a custom HTTP monitoring service in Go, instrumenting `net/http` transport to capture latency and errors (middleware), reducing diagnostic time from hours to minutes.
- **Infrastructure as Code:** Automated AWS provisioning for 50+ microservices across three environments using Terraform, establishing least-privilege IAM policies.
- **Team Enablement:** Trained Java and frontend teams on Golang, enabling them to develop and debug Go services independently.

**Enterprise Training & Consulting**

- Delivered Docker training for engineering teams at the SEB Group.
- Provided backend development and consulting for e-commerce platforms.

### **Technical Instructor** | ESGI (Paris & Lyon) | _Sep 2021 – Feb 2024_

- **Curriculum Development & Delivery:** Designed and delivered master's-level courses on Golang, microservices (gRPC, NestJS), and advanced CI/CD with GitHub Actions for 200+ students.
- **Pedagogical Method:** Conducted deep technical research and built comprehensive projects for each subject, then crafted hands-on exercises and labs to foster bidirectional knowledge transfer.
- **Project Guidance:** Mentored students in building real-world applications, including API-driven Go services, real-time systems, and containerized deployments on Kubernetes.

### **Fullstack Web Developer** | Gymglish → Fastory | _Sep 2019 – Jul 2021_

**Fastory (Jan 2021 – Jul 2021)**

- **Real-Time Engagement Systems:** Built a contest leaderboard using Node.js and Redis, handling high-frequency score updates with **<100ms latency** to boost user engagement through competition.
- **High-Performance Data Pipelines:** Developed an optimized webhook system with Hapi.js for efficient, real-time chatbot data retrieval and analytics.
- **Next.js** : developed Next/React pages for mini games real time editors (WYSIWYG).

**Gymglish (Sep 2019 – Dec 2020)**

- **Performance Optimization:** Refactored a MongoDB data export pipeline, implementing parallel queries and efficient aggregations to reduce CSV generation time from **15+ minutes to under 2 minutes** for 100K+ records.
- **Docker** : Dockerized the dev environment.
- **Python Refactoring** : Rewrote the complete app in Python/Angular.
- **React & Node.js** : Wrote component, pages and services for new features.

---

## Education & Certifications

- **Master's Degree, Software Engineering** – ESGI, Paris
- **Certified Kubernetes Administrator (CKA)** – The Linux Foundation
- **Certified Kubernetes Application Developer (CKAD)** – The Linux Foundation

---

## Languages

French (Native), English (Fluent), Persian (Conversational)
