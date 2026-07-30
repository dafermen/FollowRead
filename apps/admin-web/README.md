# FollowRead Admin

Standalone web application for creating, reviewing, processing, and publishing content.

## Commands

- `pnpm --filter @followread/admin-web dev`
- `pnpm --filter @followread/admin-web test`
- `pnpm --filter @followread/admin-web build`

## Available screens

- `/` Editorial dashboard;
- `/content` catalog and filters;
- `/content/new` draft creation;
- `/content/{id}/edit` bilingual editor, recovery, and illustrations;
- `/processing` audio, voices, costs, and diagnostics;
- `/reviews` review, history, and publishing;
- `/documentation` installation and operation within the app.

In development, if there is no session, these screens show a preview identified with sample data to facilitate visual demonstrations.
