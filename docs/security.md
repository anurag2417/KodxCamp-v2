# Security

What we protect, from whom, and how. Read this before changing anything auth-related.

## The threat model

We're a small site with:
- Learners, some of whom are minors
- Free access via coupons
- No payment data stored on our servers (Razorpay handles payments)
- No user-uploaded files (until Phase 2, if ever)
- Code execution running entirely in the visitor's browser

**We are not defending against:**
- Nation-state attackers
- Physical access to our infrastructure (Render/Neon handle that)
- Targeted DDoS (Cloudflare fronts Render)

**We are defending against:**
- Credential stuffing (login rate limits + generic error messages)
- Coupon code guessing (long random codes + redemption rate limits)
- Session hijacking (HTTP-only cookies, short access tokens)
- SQL injection (Drizzle parameterizes; no string concatenation)
- XSS (helmet's default headers; React escapes by default; CodeMirror sanitizes)
- CSRF (SameSite=Lax cookies; origin checks on state-changing requests)
- Information disclosure via error messages (generic errors; request IDs for correlation)
- Email enumeration (register/forgot always return the same response)
- Scraping course content (content served only after access check)

## Secrets

**Never in the repo:**
- Database URLs
- JWT secrets
- OAuth client secrets
- Gmail service account JSON
- Turnstile secret key
- Sentry DSN (server-side)

**Where they live:**
- Local dev: `.env.local` (git-ignored)
- Production: Render dashboard, per-service environment
- CI: GitHub repository secrets

**Rotation policy:**
- JWT secrets: rotate if leaked; rotating invalidates all sessions
- OAuth secrets: rotate if leaked; users re-link on next login
- Gmail service account: rotate if leaked; existing tokens stay valid
- Turnstile keys: rotate if leaked

## Authentication

### Password storage

Argon2id with:
- 64 MB memory cost
- 3 iterations
- Parallelism 4

Never MD5, SHA, bcrypt, or scrypt. (Argon2id is the current OWASP recommendation.)

### Sessions

Two tokens:
- **Access token:** JWT, 15-minute lifetime, sent in `Authorization: Bearer ...` header. Kept in JS memory only — never localStorage, never sessionStorage.
- **Refresh token:** opaque random string, 30-day lifetime, stored in an HTTP-only, Secure, SameSite=Lax cookie.

**Refresh token rotation:** every refresh call generates a new token, invalidates the old one, and records the chain (`sessions.family_id`). If a revoked token is presented, the **whole family is revoked** — this catches stolen refresh tokens.

**Logout:** clears the cookie, revokes the session row, and invalidates the whole family.

### OAuth (Google, GitHub)

- We request only `openid`, `email`, `profile`.
- Account linking: only when the provider-returned email is verified.
- No passwords stored for OAuth-only accounts.
- New OAuth users are `pending_terms` until they accept terms.

## Authorization

Every gated resource checks a **grant**:

```sql
SELECT 1 FROM access.grants
WHERE user_id = $1
  AND revoked_at IS NULL
  AND (expires_at IS NULL OR expires_at > now())
  AND (
    scope_type = 'all'
    OR (scope_type = 'course' AND scope_code = $2)
    OR (scope_type = 'roadmap' AND scope_code IN (
      SELECT roadmap_code FROM ... -- roadmap-to-course mapping
    ))
  )
```

Roles:
- **student** (default): can access granted content.
- **instructor** (Phase 3): can manage cohorts.
- **admin**: everything.

**Admin accounts are created by a setup script, never by signup.**

## Cookies

| Cookie | Purpose | Attributes |
|---|---|---|
| `kc_refresh` | Refresh token | HttpOnly, Secure (prod), SameSite=Lax, Path=/api/auth/refresh, 30d |
| `kc_csrf` | (Phase 1a, if needed) | HttpOnly=false, Secure (prod), SameSite=Lax, 1d |

**SameSite=Lax** is important: it prevents cross-site POST CSRF while allowing normal top-level navigations (which is what OAuth callbacks are).

## Rate limits

Per IP:
- Login: 10 attempts / 15 min
- Register: 5 attempts / 60 min
- Forgot password: 3 attempts / 60 min
- Coupon redeem: 10 attempts / 15 min
- Snippet save: 30 / hour
- Compiler Run: soft-gated per session (Phase 1b)

Per email hash (independent of IP):
- Login failure: 20 / hour (catches distributed credential stuffing on one account)

**All rate limits return a generic 429** — no hint about which limit was hit.

## Email enumeration protection

Register, forgot password, and email change all return:
> "If the email exists, we sent a link."

The actual work happens asynchronously; the response time is padded to look identical regardless.

## Captcha

Cloudflare Turnstile on:
- Register
- Forgot password (after 2 attempts)

**Not on login** — Turnstile adds latency; rate limits are enough.

## User-submitted code (Phase 1b, 1c, 2)

**All code runs in the browser.** No server-side execution. This is a security decision, not just a cost one.

Implementation:
- Web Worker per run.
- Timeout kills the worker.
- Worker has no access to `document`, `window`, cookies, or IndexedDB.
- Communication is only via `postMessage`.
- Python/Ruby WASM runtimes are sandboxed by the WASM runtime.

When Java arrives (later): a **separate** sandboxed server with:
- Firecracker microVM or gVisor
- No network access
- CPU + memory caps
- Filesystem read-only except for a temp dir

**Never do this on the main server.**

## Content delivery

Course content is fetched through the API after an access check. The static site bundle contains only:
- Course titles, summaries, outlines
- Landing pages
- No lesson bodies, no exercises, no solutions

See ADR-0005.

## Logging and privacy

**We log:**
- Request method, path, status, duration, request ID
- Error stack traces (server-side only)
- User ID on actions, never email or IP in plain text

**We don't log:**
- Passwords (even hashed)
- Tokens
- Request bodies containing sensitive data
- IP addresses (only salted hashes, for rate limiting)

## Data we store

| Data | Purpose | Retention |
|---|---|---|
| Email | Login, contact | Until account deleted |
| Password hash | Login | Until account deleted |
| Name | Display | Until account deleted |
| IP hash | Rate limiting | 30-90 days |
| User agent | Session forensics | Until session expires |
| Progress | Learning | Until account deleted |
| Consent records | Legal proof | Until account deleted |
| Email log | Delivery tracking | 12 months |
| Audit log | Admin actions | 24 months |
| Payments | Financial records | Kept after account deletion (null user_id) |

**Data we do NOT store:** date of birth, phone number, address, government ID, payment card data.

## Account deletion

Deleting an account:
- Cascades through `auth`, `access`, `core`, `stats`, `learn`, `practice`, `live`.
- Leaves orphaned rows in `feedback_reports`, `email_log`, `audit_log`, `payments` (with user_id set to NULL).
- Is irreversible.

## Legal note

With no age gate, learners under 18 can sign up. Per our current understanding of India's data protection rules, duties for children's data become enforceable on **14 May 2027**. Before launch, get legal advice — including whether XP, streaks, and weekly emails count as tracking.

We keep data minimal by design: no DOB, no phone, no address.

## What to do if something goes wrong

See `docs/runbook.md` — "Incident response" section.
