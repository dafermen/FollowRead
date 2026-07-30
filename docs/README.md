# FollowRead Documentation

The master PDF remains in this folder as the original source. The Markdown documents convert
that source into requirements, decisions, and verifiable work.

## Map

### Canonical entries

| Documento | Propósito |
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

| Carpeta | Propósito |
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
