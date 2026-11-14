# Administrator sign-in

The requested email OTP flow replaces password login. Only active, explicitly approved AdminUser records can sign in. There is no visitor signup. The legacy passwordHash field is optional, excluded from reads, and unused by this flow.

## Configure email

Keep these server-side values in apps/api/.env (never VITE variables):

```dotenv
SMTP_HOST=your-mail-provider-host
SMTP_PORT=465
SMTP_USER=authorized-mailbox-user
SMTP_PASS=your-mail-provider-app-password
```

SMTP_USERNAME and SMTP_PASSWORD are accepted aliases. The sender is fixed to contact@artopusindia.com; SMTP_FROM does not override it. The provider must permit this sender. Port 465 uses implicit TLS; port 587 requires STARTTLS. Certificate verification stays enabled. Restart the API after editing its environment. Verify SPF/DKIM/DMARC and inbox delivery with the mailbox provider before production.

The configured SMTP connection/authentication was verified in this workspace. That check alone does not prove inbox delivery.

## Approve an administrator

From the repository root:

```powershell
npm run admin:user -- person@example.com "Display name" admin active
```

The same command updates access. Use editor instead of admin for content access without site settings. Use disabled instead of active to revoke access; every protected request checks current account status and role. There is no default user or public enrollment endpoint.

Open http://localhost:5173/admin/login, enter the approved email and request a code. Check spam if necessary. Keep the requesting browser tab open: codes are bound to that browser session. The code expires after five minutes and permits five verification attempts. Requesting another code invalidates the previous code. Wait at least 60 seconds between requests, with a six-code hourly limit per email and additional IP limits.

## Session and request protection

- Cryptographically random six-digit codes; only purpose-separated HMAC digests are stored.
- Atomic one-time consumption and attempt accounting; explicit expiry checks independent of MongoDB TTL cleanup.
- No OTPs, SMTP credentials or authentication tokens are logged or stored in browser localStorage.
- Session ID rotates after verification. Session records live in MongoDB; cookies are HTTP-only and SameSite=Lax.
- Production cookies require HTTPS and have Secure set. Sessions have an absolute eight-hour lifetime.
- CSRF tokens are session-bound and required on sign-in, verification, sign-out and content mutations, together with an exact Origin match.
- Private API responses use Cache-Control: no-store. Responses never contain codes or password hashes.
- Unknown/disabled addresses get the same request message without sending an email or creating an account.
- Missing mail configuration and SMTP failures fail closed; there is no development code bypass.

Set WEB_ORIGIN to the exact frontend origin. Keep frontend and API on the same site, preferably proxying /api to the API. Only set TRUST_PROXY_HOPS to the exact number of trusted reverse proxies; leave zero for a directly served local API. MONGODB_URI is the canonical database setting; MONGO_URI is accepted as an alias.

## Tests

admin.integration.test.ts uses a unique temporary MongoDB database and an injected test mailer. Test codes exist only inside the test process. It exercises expiry, attempts, resend, replay, simultaneous verification, disabled users, roles, CSRF/origin, cookie flags, session lifetime, rate limits, delivery failures and authenticated CMS operations.

Live verification on 2026-11-14: the login screen requested an OTP through the configured SMTP service as contact@artopusindia.com. SMTP accepted it for the approved administrator. Inbox receipt was not independently checked. Automated tests and browser fixtures verify code consumption without reading or logging real codes.
