---
layout: home
title: FollowRead Documentation
titleTemplate: Product and Engineering Guide

hero:
  name: FollowRead
  text: Product and engineering documentation
  tagline: Understand the reading experience, architecture, quality gates, and delivery workflow.
  image:
    src: /followread.svg
    alt: FollowRead logo
  actions:
    - theme: brand
      text: Explore the product
      link: /requirements/PRODUCT_VISION
    - theme: alt
      text: View current status
      link: /project-management/PROJECT_STATUS

features:
  - title: Product
    details: Vision, MVP scope, user journeys, requirements, and accessible experience design.
    link: /requirements/PRODUCT_VISION
  - title: Architecture
    details: API, data, synchronized narration, offline reading, mobile, and security decisions.
    link: /ARCHITECTURE
  - title: Quality and delivery
    details: Test strategy, evidence, deployment, operations, releases, backup, and rollback.
    link: /TESTING
---

## Documentation map

The master PDF remains in this folder as the original source. The Markdown documents convert
that source into requirements, decisions, and verifiable work.

## Map

### Canonical entries

| Document | Purpose |
|---|---|
| `ARCHITECTURE.md` | Topology, boundaries, and decisions |
| `API.md` | Contracts and OpenAPI access |
| `DEVELOPMENT.md` | Preparation and development flow |
| `TESTING.md` | Strategy and thirteen mandatory tests before deploying |
| `DEPLOYMENT.md` | Release sequence and policy |
| `OPERATIONS.md` | Health, backup, observability, and incidents |
| `SECURITY.md` | Privacy, secrets, threats, and auditing |
| `TROUBLESHOOTING.md` | Diagnostics and runbooks |

These entries link to the detailed documentation; they do not replace it.

### Detailed sources

| Folder | Purpose |
|---|---|
| `requirements/` | Vision, scope, requirements, stories, cases, and traceability |
| `architecture/` | Context, boundaries, security, and technical decisions |
| `ux-ui/` | Strategy, flows, and accessible design |
| `testing/` | Strategy, plans, and testing evidence |
| `deployment/` | Environments, deployment, migration, and rollback |
| `project-management/` | Phases, tasks, status, risks, decisions, and sessions |
| `development/` | Guides for contributing and maintaining code |
| `troubleshooting/` | Domain diagnostics |
| `api/` | Contracts and API guide |
| `user-guides/` | Guides for readers and administrators |
| `adr/` | Architectural decisions with context and consequences |

## Start of each session

Read, in this order:

1. `project-management/PROJECT_STATUS.md`
2. `project-management/PHASES.md`
3. `project-management/TASKS.md`
4. `project-management/NEXT_STEPS.md`
5. latest entries of `project-management/SESSION_LOG.md`
6. `project-management/KNOWN_ISSUES.md`
7. `project-management/DECISIONS.md`

Then identify the first executable task and do not advance phases.

## DOC-STD-20261002 — Canonical sources

Documentation standard v1.0 · reviewed 2026-10-02. Primary language: English.

Local-first reading application with Admin, Reader and API.

SQLite is the MVP database. The fake speech adapter must work without provider keys; AWS/Polly is optional. Local ports are Admin 5173, Reader 5174 and API 8000. Physical iOS/TestFlight validation remains a separate external gate.

| Need | Authoritative source |
| --- | --- |
| Presentation | [README.md](https://github.com/dafermen/FollowRead/blob/main/README.md) |
| Current state | [docs/CURRENT_STATUS.md](CURRENT_STATUS.md) |
| Development | [docs/DEVELOPMENT.md](DEVELOPMENT.md) |
| Architecture | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| API / contracts | [docs/API.md](API.md) |
| Testing | [docs/TESTING.md](TESTING.md) |
| Security | [docs/SECURITY.md](SECURITY.md) |
| Deployment | [docs/DEPLOYMENT.md](DEPLOYMENT.md) |
| Operations | [docs/OPERATIONS.md](OPERATIONS.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| API | [docs/API.md](API.md) |
| History | [docs/CHANGELOG.md](CHANGELOG.md) |
| Decisions | [docs/adr/README.md](adr/README.md) |

Start with the presentation and current state, then read the user guide to try the product, development/architecture to contribute, or deployment/operations to maintain it. The existing detailed index remains valid.

### Evidence and updates

Keep current state, change history and decisions separate. Existing dated test results remain historical evidence. Adding this map does not rerun every documented command or complete pending product acceptance. Record actual checks, their environment and unresolved limits before publication.

Update the source guide whenever commands, configuration, behavior, permissions or deployment change. Keep existing links and portal routes stable. Use real screenshots with synthetic data; never publish env values, access keys, user data or operational logs. A local commit, a remote commit and a deployed artifact are separate states.
