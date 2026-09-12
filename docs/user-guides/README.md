# User Guides

This folder will contain vetted guides for Reader and Admin. They will be written alongside each flow to
avoid documenting interfaces that do not yet exist.


## Persistent audio processing and VPS paths

`pnpm dev` now starts the audio worker with the other local services. After updating an
existing installation, run `pnpm migrate` and restart `pnpm dev`. Admin remains on 5173,
Reader on 5174 and the API on 8000. Audio requests return a queued job immediately;
Admin polls its progress while the worker processes it. A restarted worker preserves queued
jobs and marks interrupted running jobs as failed; review provider charges before retrying.

The planned public Reader is at `/`, Admin at `/admin/` and the API at `/api/` on
`followread.innovalogic.tech`. API interactive documentation is disabled in production;
product documentation remains at `/admin/docs/`. The VPS runbook is available in the
documentation portal under Delivery → FollowRead VPS. Publication requires owner approval.
