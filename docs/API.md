# REST API

Base URL: /api/v1. Successful JSON uses { data: T }; lists return { data: { items, page, limit, total } }. Errors return { error: { code, message, details? } }. Dates are UTC ISO strings and IDs are strings. Public image references are populated objects; admin editing responses contain IDs.

## Authentication

| Method | Path | Behavior |
| --- | --- | --- |
| GET | /auth/csrf | Establish anonymous session and return { token } |
| POST | /auth/login | { email }; request OTP for an approved account |
| POST | /auth/verify | { challengeId, code }; consume OTP, rotate session |
| GET | /auth/session | Current approved administrator; otherwise 401 |
| POST | /auth/logout | Destroy session and clear cookie; 204 |

All authentication POST requests require the session cookie, X-CSRF-Token and an exact Origin match. Login returns challengeId, expiresIn, resendAfter and a generic message. OTPs are never returned. See [authentication](AUTHENTICATION.md).

## Public content

GET /blogs supports search, category, featured and pagination. GET /blogs/categories lists visible categories. GET /blogs/:slug returns a published post and related visible articles.

GET /events supports type, status (upcoming/ongoing/completed) and pagination. GET /events/:slug returns a published event. GET /classes supports mode and pagination; GET /classes/:slug returns an active offering. GET /settings returns visible public settings. GET /content/routes enumerates published detail routes.

Drafts, archived records, future-dated published articles and inactive classes are excluded. Scheduled articles are promoted when due by the running API's minute interval, including catch-up at startup.

## Protected administration

All routes require an active admin/editor session. All writes also require CSRF and Origin. All private responses use no-store.

| Method | Path | Operation |
| --- | --- | --- |
| GET | /admin/dashboard | Database counts, recent content, and pageViews { total, pages } with up to ten top pages |
| GET | /admin/{blogs,events,classes} | All statuses; search/status filter; pagination |
| POST | /admin/{blogs,events,classes} | Create validated content |
| GET | /admin/{blogs,events,classes}/:id | Editable record |
| PUT | /admin/{blogs,events,classes}/:id | Replace editable fields; removed optional values are cleared |
| DELETE | /admin/{blogs,events,classes}/:id | Archive; reversible in the editor |
| GET | /admin/{blogs,events}/:id/preview | Private sanitized saved content |
| GET | /admin/media | Paginated reusable images |
| POST | /admin/media | Multipart image + altText; validated, decoded and optimized |
| PATCH | /admin/media/:id | Change alternative text |
| DELETE | /admin/media/:id | Remove unused image from library; retain hosted file |
| GET | /admin/settings | Complete editable settings (admin role) |
| PUT | /admin/settings | Save singleton settings (admin role) |

List limits are at most 50. Class ordering uses displayOrder in the ordinary PUT; lower values appear first. Duplicate slugs return 409. Rich text is sanitized before storage and at public serialization. Invalid/missing image references return 400. Referenced images cannot be removed; library removal retains the hosted file to protect concurrent edits and previously generated pages.

GET /health reports liveness; GET /health/ready reports MongoDB readiness. They are outside the API prefix.

Public static HTML regeneration, sitemap delivery and production HTTP status handling remain Phase 4 work. API publication changes are immediate; existing HTML builds need rebuilding.

## Public page views

GET /analytics/page-views returns { data: { total } } and does not count the request. POST /analytics/page-views accepts only { path }, validates that it is a canonical public route with currently visible content, atomically increments that path's count, and returns the updated total. Both responses use no-store.

The anonymous POST requires application/json and the exact configured Origin; it does not require or create an admin session or tracking cookie. Writes are limited to 120 per IP per minute. Malformed/admin/unknown route shapes return 400, unpublished or missing detail records return 404, an invalid/missing Origin returns 403, non-JSON returns 415 and excess writes return 429. It stores no visitor identifiers. Only the aggregate total is public; the per-page breakdown is included in the protected dashboard response.
