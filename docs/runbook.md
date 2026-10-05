# Runbook

Day-to-day operations, incident response, common tasks.

## Services

| Service | Where | URL |
|---|---|---|
| Core API | Render | https://kodxcamp-core.onrender.com |
| Static site | Render | https://kodxcamp-portal.onrender.com |
| Database | Neon | (dashboard link — not public) |
| CI | GitHub Actions | https://github.com/anurag2417/KodxCamp-v2/actions |
| Uptime | UptimeRobot | https://uptimerobot.com |

## Common tasks

### Deploy a new version

Push to `main`. Render auto-deploys. Watch the deploy at the Render dashboard.

If auto-deploy fails, check:
1. Was the push successful? (`git log origin/main`)
2. Did GitHub Actions CI pass?
3. Did Render's build log show the error?

### Roll back a bad deploy

Render dashboard → service → **Events** → find the last good deploy → **Rollback to this deploy**.

Rollback is nearly instant (no rebuild).

### Rotate a secret

1. Generate new secret (e.g. `openssl rand -base64 48`).
2. Render dashboard → service → **Environment** → edit the value → **Save**.
3. Service redeploys automatically.
4. Test: hit `/health`, then the relevant endpoint.

**Rotating JWT secrets** invalidates all sessions — users must log in again.

### Add a new env var

1. Add it to `render.yaml` in the appropriate `envVars` block with `sync: false`.
2. Set the value in the Render dashboard.
3. Add it to `.env.example` at the repo root for local dev.
4. Commit and push.

### Restart the service

Render dashboard → service → **Manual Deploy** → **Deploy latest commit**. Or **Restart** for a quick bounce (same code, no rebuild).

### View logs

Render dashboard → service → **Logs**. Streaming, searchable.

**Locally:**
```bash
pnpm dev:core
```
Output is structured JSON (one line per event).

### Inspect the database

Use Neon's SQL Editor in their dashboard, or:

```bash
psql "$DATABASE_URL_DIRECT"
```

Never run migrations manually via `psql`. Use Drizzle (see below).

### Run migrations

Locally:
```bash
pnpm db:generate  # generate SQL from schema changes
pnpm db:migrate   # apply to local DB
```

Production: migrations run automatically on deploy (via `render.yaml` build command, added in Phase 1a).

**Never edit a committed migration.** Create a new one.

### Restore from backup

1. Download the latest `kodxcamp-*.dump` from the Actions tab → Backup database → workflow run → Artifacts.
2. Provision a scratch Neon database.
3. `pg_restore --clean --if-exists --no-owner --no-acl -d <scratch-url> kodxcamp-*.dump`
4. Verify row counts and a sample query.
5. To promote scratch to production: change `DATABASE_URL` in Render to the scratch URL. **This is the risky step — do it only when you're confident.**

**Practice this once before launch.**

## Incident response

### Site is down (5xx errors)

1. Check UptimeRobot — is the alert real?
2. `curl https://kodxcamp-core.onrender.com/health` — does it respond?
3. Render dashboard → Logs — look for a spike of errors.
4. If a recent deploy is suspect: **roll back**.
5. If the database is unreachable: check Neon status page.
6. If Render is having an outage: check https://status.render.com.

### Wrong data is showing

1. Is it a caching issue? Hard-refresh (Ctrl+Shift+R).
2. Is it a deploy artifact? Roll back to the last good deploy.
3. If neither, inspect the specific request: filter Render logs by the request ID from the browser's network tab.

### Suspected security incident

1. **Do not panic-delete logs.** Preserve evidence.
2. Rotate all secrets that might be affected:
   - JWT secrets → invalidates all sessions
   - DB password (Neon dashboard) → update in Render
   - OAuth secrets → rotate in Google/GitHub
   - Gmail service account → rotate in Google Cloud
3. Notify affected users via the `account-deleted` email template adapted for "we're writing to you about a security matter."
4. If children's data is involved, consider regulatory notification.
5. Write a post-mortem in `docs/incidents/YYYY-MM-DD-title.md`.

### Data loss

1. Restore from the nightly backup (see above).
2. Determine the cause: was it a bug, a bad migration, or a deletion?
3. Fix the cause before restoring, or you'll lose the data again.

## Monitoring

### UptimeRobot

- Monitors `https://kodxcamp-core.onrender.com/health` every 5 minutes.
- Alerts by email if down for 2 consecutive checks.
- Keeps the free-tier service warm (no 15-minute sleep).

### GitHub Actions

- **CI:** runs on every push and PR. Failure = red X in the commit.
- **Backup database:** runs nightly at 23:30 IST. Skips cleanly if the DB isn't configured.

### Sentry (Phase 1a)

- Reports unhandled errors with stack traces and request context.
- Configured via `SENTRY_DSN` env var. No DSN = no reporting.

## Health checks

| Endpoint | Purpose | Touches DB? |
|---|---|---|
| `/health` | Liveness (process is up) | No |
| `/healthz` | Alias for `/health` | No |
| `/health/db` | Readiness (DB reachable) | Yes |

**Only `/health` is pinged externally.** We don't want the monitor keeping Neon compute awake 24/7.

## Backups

- **Frequency:** nightly at 23:30 IST.
- **Method:** `pg_dump --format=custom` via GitHub Actions.
- **Storage:** GitHub Actions artifacts (30-day retention).
- **Restore:** see "Restore from backup" above.

**Before launch:** restore once into a scratch DB, verify, and document the time it took. Trust is built by testing.

## Scales and limits (free tier)

| Resource | Limit | Current usage |
|---|---|---|
| Render web service | 750 hrs/mo shared, 512 MB RAM | Well under |
| Render static bandwidth | 100 GB/mo | Tiny |
| Neon storage | 0.5 GB | Empty |
| Neon compute hours | 191 hrs/mo | Idle-friendly |
| GitHub Actions minutes | 2,000/mo | ~5 per day |
| Gmail sends | 500/day | 0 |

## When we outgrow free tier

Signals:
- Render service cold-starts despite uptime monitor (means frequent deploys)
- Neon approaching storage limit
- Gmail hitting daily send caps
- CI minutes approaching limit

First upgrade: **Render Starter plan ($7/mo)** — always-on, more RAM.

Second: **Neon Launch plan ($19/mo)** — more storage and compute.

Third: **own domain** (~₹800/yr) for `kodxcamp.com`.
