# Troubleshooting

This is the canonical entry for diagnosing FollowRead.

## First diagnosis

```powershell
pnpm dev:check
pnpm hooks:verify
pnpm check:fast
pnpm mobile:doctor
pnpm deploy:validate
```

Also check:

- Node 24 and pnpm 11.9.0;
- Python 3.12 and `apps/api/.venv`;
- ports 5173, 5174 and 8000 available;
- SQLite migration applied;
- variables based on `.env.example`, no secrets in Git.

## Specific guides

- [Diagnosis index](troubleshooting/README.md)
- [Android/Capacitor](troubleshooting/CAPACITOR_ANDROID.md)
- [iOS/Capacitor](troubleshooting/CAPACITOR_IOS.md)
- [Environment variables](development/ENVIRONMENT_VARIABLES.md)
- [Known issues](project-management/KNOWN_ISSUES.md)

If the issue is not documented, log symptoms, environment, reproduction steps, expected/actual result and fix before closing the task.
