# Implementation Plan

## Strategy

FollowRead will advance in phases with verifiable vertical cutoffs. Each phase must produce a demonstrable outcome, not just isolated files.

## Order

1. Close product, risks, requirements, and strategies in Phase 0.
2. Design accessible flows and visual system in Phase 1.
3. Create monorepo, environments, and quality controls in Phase 2.
4. Build API and data before depending on them from end interfaces.
5. Protect identity and permissions before a publishable Admin.
6. Implement Admin and editorial flow.
7. Integrate Polly via adapters and jobs.
8. Develop Reader Engine with deterministic fixtures.
9. Integrate Reader web/PWA.
10. Add offline support before packaging mobile apps.
11. Incorporate Capacitor and then remaining educational capabilities.
12. Harden, automate deployments, and complete documentation.

## Recommended delivery cutoff

The first complete technical demo should include a bilingual story that goes through:

```text
Admin -> procesamiento falso/real controlado -> revisión -> publicación
-> catálogo -> descarga -> reproducción sincronizada -> progreso offline
```

That cutoff validates the biggest risks without building the entire feature catalog.

## Change control

- A new dependency requires documented need, alternatives, and consequence.
- An architectural boundary change requires a decision.
- A TODO requires a task or known issue.
- A new requirement must enter traceability before implementation.
- A phase does not silently inherit critical debt.
