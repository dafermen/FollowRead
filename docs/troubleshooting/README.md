# Troubleshooting

Specific documents will be created when a verifiable deployment exists. Each guide will include symptom, likely cause, confirmation, files, diagnosis, fix, validation, and prevention.

Planned areas: audio, Speech Marks, AWS, database, authentication, Reader sync, Capacitor Android/iOS, offline, and deployment.

Mobile guides:

- `CAPACITOR_ANDROID.md`
- `CAPACITOR_IOS.md`
# Troubleshooting

## `/health` responds but `/ready` returns 503

The process is alive, but SQLite is not accepting queries. Check:

1. that `FOLLOWREAD_DATABASE_URL` starts with `sqlite:///`;
2. that the database directory exists and is writable by the process;
3. that `pnpm migrate` has applied the Alembic head;
4. that `var/followread.db` has not been moved or locked.

Do not replace readiness with health in a deployment check.

## Correlate a 500 error

Copy the `X-Request-ID` value from the response or `error.details.request_id` and search for it in the JSON logs. The response does not contain traces or database details by design.

## The catalog is empty

Confirm that the publication is active, the version has status `published`, and that `checksum` and `package_url` exist. Drafts, inactive publications, and incomplete packages are excluded.
