# Next steps

## Exact next action

**FR-PH13-TASK-012: owner review of the locally validated web VPS candidate.**

1. Review the local commit, candidate evidence and VPS runbook. No remote write is authorized yet.
2. With owner approval, push the preparation branch and open a PR; configure protected main,
   reviewed release tags and a protected GitHub `release` environment.
3. Require the updated CI/container/TLS/security jobs on the final commit, then publish only the
   approved version and immutable image manifest. Manual dispatch validates without publishing.
4. Agree initial production data, account provisioning and off-server encrypted backup storage.
5. Obtain the owner's final VPS rollout approval. Add only FollowRead's Nginx site/certificate,
   install the reviewed images by digest, backup/migrate and verify external HTTPS and restoration.
6. Record acceptance and rollout evidence before closing Phase 13.

Docker/Compose, local HTTPS and backup restoration are now exercised through WSL. The domain and
existing VPS have been identified through read-only inspection. Read the
[candidate evidence](../testing/VPS_CANDIDATE.md) and [runbook](../deployment/VPS_DEPLOYMENT.md).

No source-control push, tag, release, certificate issuance, remote file change or deployment has
been performed during preparation. Physical iOS validation remains separate from this web scope.
