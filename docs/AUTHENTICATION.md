# Administrator sign-in

The requested email OTP flow replaces password login. Only active, explicitly approved AdminUser records can sign in. There is no visitor signup. The legacy passwordHash field is optional, excluded from reads, and unused by this flow.

## Configure email

Keep these server-side values in apps/api/.env (never VITE variables):

```dotenv
RESEND_API_KEY=your-resend-api-key
```

The sender is fixed to Artopus India <contact@artopusindia.com>. Verify artopusindia.com in [Resend](https://resend.com/docs/dashboard/domains/introduction) and configure the API key on the Render service. Production startup requires a nonblank RESEND_API_KEY. Development/test may start without it, but OTP requests then fail closed. Restart or redeploy after changing the environment.

Delivery uses POST https://api.resend.com/emails over HTTPS with a ten-second timeout and no automatic retries. This avoids the SMTP ports blocked on [Render Free](https://render.com/docs/free). Non-success responses, network/timeouts and invalid provider responses return the existing generic MAIL_UNAVAILABLE error without exposing provider details. No SMTP configuration is used.

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
- No OTPs, API keys or authentication tokens are logged or stored in browser localStorage.
- Session ID rotates after verification. Session records live in MongoDB; cookies are HTTP-only and SameSite=Lax.
- Production cookies require HTTPS and have Secure set. Sessions have an absolute eight-hour lifetime.
- CSRF tokens are session-bound and required on sign-in, verification, sign-out and content mutations, together with an exact Origin match.
- Private API responses use Cache-Control: no-store. Responses never contain codes or password hashes.
- Unknown/disabled addresses get the same request message without sending an email or creating an account.
- Missing mail configuration and Resend failures fail closed; there is no development code bypass.

Set WEB_ORIGIN to the exact frontend origin. Keep frontend and API on the same site, preferably proxying /api to the API. Only set TRUST_PROXY_HOPS to the exact number of trusted reverse proxies; leave zero for a directly served local API. MONGODB_URI is the canonical database setting; MONGO_URI is accepted as an alias.

## Tests

admin.integration.test.ts uses a unique temporary MongoDB database and an injected test mailer. Test codes exist only inside the test process. It exercises expiry, attempts, resend, replay, simultaneous verification, disabled users, roles, CSRF/origin, cookie flags, session lifetime, rate limits, delivery failures and authenticated CMS operations.

Resend adapter/configuration tests cover successful acceptance, provider HTTP errors, network/timeouts, malformed responses, missing production configuration and secret-free error handling. They mock HTTPS delivery and send no real emails; live Resend acceptance and inbox receipt have not been verified.
