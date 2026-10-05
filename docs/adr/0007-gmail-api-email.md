# ADR 0007 — Gmail API for email, not SMTP

**Status:** accepted (2026-10-05)

## Context

We need to send transactional emails (verify, reset password, weekly digest). Budget: ₹0. Options:

- Gmail SMTP (Gmail's traditional SMTP relay)
- Gmail API over HTTPS
- A transactional email provider (Resend, Postmark, Mailgun, SendGrid, AWS SES)
- Self-hosted SMTP

**Key constraint:** Render's free tier blocks outbound SMTP (ports 25, 465, 587). This is a documented Render limitation — they block SMTP to prevent spam from free accounts.

## Decision

**Gmail API over HTTPS**, using a Google Cloud service account with domain-wide delegation or explicit Gmail send scope.

## Why Gmail API

- **Works on Render's free tier.** HTTPS is allowed; SMTP isn't.
- **Free.** Up to 500 recipients/day per Gmail account. Plenty for our scale.
- **Reputable sender.** Emails from `@gmail.com` addresses have good deliverability.
- **No new vendor.** We're already using Google for OAuth — no extra account, no extra bill, no extra dashboard.

## Why not SMTP

- **Blocked by Render.** This is disqualifying.

## Why not a transactional provider

- **Cost.** All the good ones charge after a small free tier.
- **Vendor lock-in.** Switching later means rewriting templates and possibly IP warming.
- **Overkill.** We're sending a few emails a day, not thousands.

## Why Gmail API is not ideal

Let's be honest about the trade-offs:

- **500/day limit.** Fine now, painful later. Migration to a real provider is planned before we approach that limit.
- **"From: noreply@kodxcamp.com" is not possible on Gmail free.** Emails will arrive from `something@gmail.com`. When we buy a domain, we can use Google Workspace to send `@kodxcamp.com` and still use the API.
- **Rate limits per minute.** Gmail API allows ~100 sends/min. Fine for us.
- **OAuth token refresh.** The service account needs to be configured correctly; a bad setup means silent email failures.

## Implementation

- **Auth:** Google Cloud service account with `https://www.googleapis.com/auth/gmail.send` scope.
- **Credential:** JSON key, base64-encoded, stored as `GMAIL_SERVICE_ACCOUNT_JSON_BASE64` env var in Render.
- **Sender:** `GMAIL_SENDER_ADDRESS` env var (the Gmail address that "sends" the mail).
- **Library:** `googleapis` npm package.
- **Template:** minimal HTML with inline CSS. Text fallback is required by Google for some account types.

## Rate-limiting at the application layer

Our own `stats.email_log` table tracks sends:
- `UNIQUE (user_id, kind, period_key)` prevents duplicate sends.
- Digest emails stop at 400/day and continue the next day.
- Weekly digest runs are recorded in `weekly_digest_runs` so a crash doesn't double-send.

## Switching providers later

The API is stable: `sendEmail({ to, subject, html, text })`. Behind it, providers can be swapped:
- **Gmail** (current)
- **Resend** (drop-in when we have budget)
- **SES** (cheapest at scale)

The `mailer/` directory in `shared/server-kit/src/mailer/` has one file per provider. Adding a provider means one new file and a config flag.

## Consequences

**Positive:**
- Zero-cost email on Render's free tier.
- No new vendor relationship.
- Good deliverability.

**Negative:**
- Limited to 500/day.
- Sender address is `@gmail.com` until we buy a domain + Workspace.
- Service account setup is fiddlier than an API key.

## Notes

- Provider: `shared/server-kit/src/mailer/gmail.provider.ts` (Phase 1a).
- Templates: `shared/server-kit/src/mailer/templates/*.html`.
- Fallback provider (Resend): `shared/server-kit/src/mailer/resend.provider.ts` (stub only, not implemented).
- Google Cloud project: linked to the same project as OAuth.
