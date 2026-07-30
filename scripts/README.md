# Scripts

- `setup-python.mjs`: creates the Python 3.12 environment and installs the API.
- `run-python.mjs`: always runs the API's isolated Python.
- `setup-hooks.mjs`: configures `.githooks` and registers the local pnpm path inside `.git`.
- `verify-hooks.mjs`: checks that the expected hook is active.
- `validate_workflow.py`: validates CI permissions, actions, and commands.
- `validate-documentation.mjs`: validates canonical documents, templates, links, and the thirteen pre-deployment categories.
- `validate-mobile.mjs`: blocks Admin, unnecessary permissions, or incomplete mobile resources.
- `mobile-doctor.mjs`: detects Android/iOS tools without modifying the machine.
- `mobile-build.mjs`: builds the Android debug APK with the Android Studio JDK.
- `verify-reader-mobile-e2e.mjs`: tests safe areas, reflow, rotation, and progress in Chrome.
- `verify-learning-e2e.mjs`: demonstrates learning mode, persistence, and mobile reflow.
- `verify-accessibility.mjs`: audits eight real routes in Chrome with a mobile viewport.
- `verify-quality-budget.mjs`: enforces bundle, gzip, cache, header, and metric budgets.
- `load-test.mjs`: measures concurrency, failures, and p95 of the local API over SQLite.
- `run-regression.mjs`: chains the full gate, E2E, and Phase 12 audits.
- `validate-deployment.mjs`: reviews Dockerfiles, Compose, CI, release, and examples for no secrets.
- `deploy-compose.mjs`: deploys or reverts images per environment with explicit approval.
- `deployment-smoke-test.mjs`: checks readiness, catalog, and deployed shells.
- `release-notes.mjs`: generates reproducible notes from commits and a SemVer tag.
- `capture-readme-screenshots.mjs`: captures the four portfolio screenshots used by the root README
  from the running Reader and Admin applications.

The same scripts are used from Windows and GitHub Actions; they do not duplicate the quality gate.
