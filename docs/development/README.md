# Development documentation

## Node.js and pnpm on Windows

FollowRead requires Node.js 24 and pnpm 11.9.0.

```powershell
node --version
npm install --global pnpm@11.9.0
pnpm --version
```

After installing, open a new terminal. If the PowerShell policy blocks `pnpm.ps1`,
run `pnpm.cmd` instead.

From the repository root:

```powershell
pnpm setup
pnpm migrate
pnpm check
```

## Start everything with one command

After `pnpm setup` and `pnpm migrate`:

```powershell
pnpm dev
```

This starts the API (`8000`), Admin (`5173`) and Reader (`5174`) in the same terminal. `Ctrl+C` stops
all three processes. You can validate prerequisites without starting servers with `pnpm dev:check`.

## Documentation visible in the apps

- Reader: `http://localhost:5174/documentation`
- Admin: `http://localhost:5173/documentation`
- OpenAPI: `http://localhost:8000/docs`

The "View documentation" links on the landing screens open the embedded guide.

## Create the first superadmin

After migrating SQLite, run from the repository root:

```powershell
pnpm admin:bootstrap -- --email admin@example.com --display-name "FollowRead Owner"
```

The command prompts for and confirms the password without displaying it or including it in the arguments. It must
be between 15 and 128 characters. Re-running the command for the same superadmin is safe and does not
change their password. It also syncs the initial matrix of roles and permissions.
