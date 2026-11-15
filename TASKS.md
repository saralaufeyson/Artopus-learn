# Artopus Learn implementation tasks

Phase 3 is implemented and verified. Production HTML invalidation, SEO release gates and deployment remain next.

## Phase 1 - Project foundation

- [x] Analyze the provided requirements and record architecture decisions.
- [x] Create npm workspaces for web, API and shared contracts.
- [x] Configure strict TypeScript and ESLint.
- [x] Configure React, Vite, Tailwind, React Router and TanStack Query.
- [x] Create public/admin layouts, route placeholders and reusable UI primitives.
- [x] Define six Mongoose models, indexes and shared input contracts.
- [x] Create backend module routes, controllers, service placeholders and validation boundaries.
- [x] Configure environment loading, MongoDB connection and Cloudinary adapter boundary.
- [x] Add health endpoints, error handling and fail-closed admin/CSRF placeholders.
- [x] Add static public skeleton prerendering.
- [x] Document API endpoints, components, schemas, setup and remaining work.
- [x] Record successful type checks, lint, tests and production builds.
- [x] Verify API startup and health/readiness against the local MongoDB instance.
- [x] Verify the current skeleton layout in a browser at phone, tablet and desktop sizes.

## Brand theme follow-up

- [x] Follow the supplied Artopus India purple/navy/light colour direction.
- [x] Add shared semantic tokens and restrained orange/pink/cyan highlights.
- [x] Apply themed surfaces and text to public/admin components.
- [x] Add an accessible light/dark switch with saved/system preferences.
- [x] Document the palette and future component usage.
- [x] Record final build and browser verification for the theme change.

## Phase 2 - Public website

- [x] Replace the placeholder homepage with the approved design and CMS sections.
- [x] Build drawing-class listing/detail pages, FAQs and external registration links.
- [x] Build upcoming/ongoing/completed event listing and details.
- [x] Build blog listing, featured posts, search, category filtering and pagination.
- [x] Build blog rich-text pages, galleries, YouTube embeds, sharing and related articles.
- [x] Build configurable about/contact pages with verified business information.
- [x] Add real or explicitly identified replaceable images.
- [x] Add content loading, empty and error states; validate responsive accessibility.

## Phase 3 - Admin dashboard

- [x] Bootstrap approved administrators securely and enforce roles; passwordless email OTP replaces passwords at the user's request.
- [x] Implement Mongo-backed sessions, secure HTTP-only cookies and session rotation.
- [x] Implement login/logout/session APIs, CSRF tokens and rate-limit verification.
- [x] Replace the fail-closed admin guard with verified sessions and role checks.
- [x] Build dashboard counts and real recent-activity data.
- [x] Build React Hook Form/Zod forms and TipTap editor.
- [x] Implement blog drafts, preview, publishing, unpublishing, scheduling and archival.
- [x] Implement event editing, posters, registration, galleries, rules and results.
- [x] Implement class editing, activation and ordering.
- [x] Implement media signature validation, optimization, alt text and safe deletion.
- [x] Implement homepage, about, registration, contact, social and SEO settings.
- [x] Implement server-side rich-text sanitization with safe link/embed policies.
- [x] Add draft persistence, validation feedback and success/error notifications.

## Phase 4 - Integration and SEO

- [x] Implement MongoDB service queries and persistence; replace all 501 placeholders.
- [x] Return only published blogs/events and active classes through public APIs.
- [x] Apply public visibility checks to media and featured-content references.
- [x] Connect all public views and admin operations to real APIs.
- [x] Define and implement the recent-activity storage strategy.
- [x] Implement reliable scheduled publication with a documented execution strategy.
- [x] Render published blog/event/class detail HTML from API data.
- [ ] Rebuild or revalidate public HTML on content changes and unpublication.
- [ ] Add unique metadata, canonical URLs, Open Graph and structured data.
- [ ] Add a published-only XML sitemap and production robots.txt.
- [ ] Add image optimization, responsive images and internal linking.

## Phase 5 - Testing and deployment

- [ ] Test all CRUD and content-management workflows against MongoDB.
- [ ] Test sessions, roles, cookie flags, CSRF, CORS and login limits.
- [ ] Test XSS sanitization, embeds, unsafe URLs and malicious file uploads.
- [ ] Test media reference protection and draft/private content visibility.
- [ ] Test scheduling, event-date boundaries and registration links.
- [ ] Test SEO HTML, unpublished URL 404s, sitemap exclusions and metadata.
- [ ] Test phone/tablet/desktop behavior and keyboard accessibility.
- [ ] Measure performance and optimize the public bundle/assets.
- [ ] Finalize HTTPS, reverse proxy, backups and production configuration.
- [ ] Document and verify the actual deployment.
- [ ] Run all required checks after each completed phase.

## Verification log

Verified on 2026-11-14:

- `npm run check`: passed (strict type checks, ESLint, tests and builds).
- API tests: 11 passed. Shared contract/timeline tests: 12 passed. Total: 23 passed.
- Client, server-renderer, API and shared-package builds: passed.
- Six generated public HTML pages contain rendered headings and remain noindex.
- Live MongoDB/Cloudinary integration and browser/device verification were not performed; no live services or production hosting were configured.

## Brand theme verification - 2026-11-14

- `npm run check`: strict TypeScript, ESLint, 23 tests and all builds passed.
- Playwright: 42 layout checks across seven routes, three phone/tablet widths and both modes passed; desktop light/dark screenshots also inspected.
- Verified switching, reload/navigation persistence, system preference changes, keyboard operation and blocked-storage fallback. No browser errors remained.
- Text contrast checks passed in both modes: supporting text at least 7.24:1, purple link/focus text at least 5.69:1, white text on primary buttons 5.69:1. Decorative orange/pink/cyan are not body-text colours.
- Corrected the client startup check so a placeholder HTML comment does not trigger hydration of an empty development root.
- Existing MongoDB/Cloudinary and remaining CMS/SEO release gates are unchanged.

## Windows launcher follow-up

- [x] Add `../start-artopus.bat` to run both apps through the existing development script.
- [x] Support paths with spaces, prerequisite checks and first-run local configuration without overwriting existing files.
- [x] Document MongoDB setup and stopping the apps.
- [x] Verify the launcher from a different working directory.

Windows launcher verified on 2026-11-14: launched from the docs folder, generated valid local environment files, built shared contracts, and started both apps. Frontend, API liveness and database readiness each returned HTTP 200. No application source changed; full app checks were not repeated for this launcher-only change.

## Phase 2 implementation notes

- Public services now use MongoDB with validated search, pagination and filters. Scheduled/future/draft posts, draft events and inactive classes are excluded.
- Insert-only demo seeding creates labeled sample content and initial site settings; registration links remain unset until real URLs are configured.
- Public rich text is sanitized; uploaded-media references, galleries and approved YouTube embeds are supported by the renderer.
- Individual public pages are generated from the API with escaped hydration data, metadata and canonical URLs. Noindex remains enabled while demo content is present.
- Administrator operations were disabled at the end of Phase 2; Phase 3 replaces those guards with verified sessions and roles. Automatic content-change regeneration, sitemap/indexing and full production SEO checks remain release gates.
- Phase 2 verification completed on 2026-11-14.

## Phase 2 verification - 2026-11-14

- Strict TypeScript, ESLint, 43 tests (25 API/security/integration and 18 shared contracts/utilities), and package/API/web builds passed.
- MongoDB integration tests used isolated temporary databases and covered publication visibility, featured references, related posts, safe rich text, search, pagination, event timing and class status.
- Browser workflows passed for class filters/FAQs, event filters, blog search/categories/featured/pagination, copy-link sharing, contact channels, missing articles and API failure/retry.
- 54 layout checks passed across nine public routes, three phone/tablet widths, and both modes; desktop screenshots were also inspected.
- 20 production-page checks passed across ten routes in light/dark modes with zero hydration errors.
- Generated 21 route documents plus a 404 document. All 14 visible detail pages matched their own titles/content, including after repeated generation. Clean URL HTML aliases are generated as well.
- Fixed the 320px blog search layout and made repeated prerendering use the original unfilled template.
- Existing development apps on port 5173/4000 were reused. The temporary production preview was used only for verification.

## Phase 3 verification - 2026-11-14

- Passwordless email OTP replaces password login at the user's request. The approved first administrator was added to the configured database; there is no public enrollment or code bypass.
- SMTP connection/authentication passed, and the live login screen successfully requested a test code through contact@artopusindia.com. SMTP accepted delivery; inbox receipt was not independently verified.
- Cloudinary authentication passed through a read-only API check. Image decoding, optimization, uploads, alternative-text persistence and reference protection were tested against an injected storage adapter. A real Cloudinary upload was not performed.
- Final npm run check passed: strict TypeScript, ESLint, 65 tests (47 API/integration/security and 18 shared), and shared/API/web production builds.
- Browser workflows passed against an isolated temporary database: OTP request/incorrect-code/verification, dashboard, article draft/preview/publish/unpublish/archive, events/registration/results, class fees/objectives/FAQs/activation/order, settings/featured content, image upload/alt text/selection/reference protection, sign-out and protected-route redirects.
- 60 responsive checks passed: login plus nine admin views at 320/390/768px in both themes. No browser errors remained; desktop screenshots were inspected.
- Added repeated-settings-save regression coverage after preserving immutable creation timestamps, and awaited session-store initialization/closure.
- Accepted MONGO_URI and SMTP_USERNAME/SMTP_PASSWORD environment aliases without changing the user's credentials. Missing site settings now initialize from brand defaults without overwriting existing content or adding invented offerings.
- Check scripts now propagate actual child exit codes; npm 9 workspace error masking was reproduced during this phase and corrected.
- Seven route documents plus the 404 document were generated from the newly configured database. Noindex remains enabled; static HTML still needs rebuilding after CMS publication changes.

- Production follow-up: 18 page checks passed in light/dark modes, including direct admin URLs, filtered public URLs and protected-route redirects, with zero hydration errors. The client now checks a rendered-route marker and mounts a fresh view for SPA fallbacks or query-filter URLs. Web type checks, targeted lint and all production builds passed again after that fix.
- Closed the temporary production preview after verification; the development frontend/API remain available.

## Owner-supplied business content - 2026-11-14

- Added the supplied Sasirekha Creations proprietorship statement, Bengaluru/Karnataka registration location, December 2025 start, current student counts, and learning/improvement commitment to the CMS. Copy is polished without adding business claims.
- Created active Buds (ages 5–12) and Blossoms (ages 12–18) offerings with online/in-person availability, preserving the supplied overlapping age ranges. Schedules, fees, instructor credentials and venue addresses were not invented. Existing blog/event content and uploaded assets were preserved.
- Added editable ownership wording to the footer and a CMS-managed featured YouTube slot on the homepage/About page. The supplied Short uses a portrait preview, click-to-load YouTube privacy-enhanced iframe, and direct YouTube fallback.
- Both-mode classes now appear under Online and In person filters. Empty learning-objective sections are hidden.
- Applied the owner copy through the explicit content:business command; future edits remain available in Classes and Site settings. This command is never run automatically.
- npm run check passed: type checks, ESLint, 77 tests (48 API/security/integration and 29 shared) and all builds. Rebuilt 11 route documents plus the 404 document from current published data.
- 36 responsive checks passed across six public routes, three phone/tablet widths and both themes. The real thumbnail and YouTube player loaded successfully; desktop screenshots were inspected.
- 12 production-page checks passed with no hydration/browser errors. A separate temporary-database browser workflow verified saving ownership/video fields and removing the featured video by clearing its link.

## Page-view counter - 2026-11-14

- [x] Add a live public footer total and protected dashboard totals for the ten most viewed pages.
- [x] Persist one MongoDB aggregate per public path using atomic increments.
- [x] Exclude admin/unknown/unpublished pages and avoid counts from rendering, filters, hashes, theme switches or ordinary re-renders.
- [x] Require exact Origin and JSON for anonymous writes; apply 120 requests per IP per minute.
- [x] Keep visitor identifiers, query strings and individual browsing history out of storage; keep analytics failures from interrupting browsing.
- [x] Verify concurrency, persistence, privacy boundaries, protected summaries, responsive layouts and production hydration.

Verification: npm run check passed with strict TypeScript, ESLint, 88 tests (56 API/integration/security and 32 shared), and all production builds. Eleven public/admin-login documents plus the 404 document were rebuilt. The build did not add page views.

Browser checks used a separately named temporary database with an injected OTP mailer, so they added no fabricated traffic or test emails to the application. Initial loads/reloads counted once under StrictMode, return navigation counted, filters/hash/theme changes did not count, unavailable/admin pages were excluded, dashboard per-page totals matched, and count-request failures neither blocked browsing nor retried writes. Twelve responsive footer/dashboard checks across 320/390/768px and both themes and four production-page checks passed with zero hydration/browser errors. Desktop and phone screenshots were inspected.

The counter measures page views, including repeat visits, rather than unique people. It starts with actual browser views after this update; no historical traffic is estimated. The temporary production preview was closed after verification; existing development services remain running.

## Resend OTP delivery - 2026-11-15

- Replaced the Nodemailer SMTP adapter with Node's built-in fetch to the Resend HTTPS API, preserving OtpMailer, the fixed Artopus India <contact@artopusindia.com> sender, subject and five-minute/one-use email text.
- Production environment validation now requires a nonblank RESEND_API_KEY. Development/test can start without email configured; OTP sign-in still fails closed. Removed SMTP settings/aliases from runtime configuration and the example, and removed the unused Nodemailer packages from the manifest/lockfile.
- Provider HTTP errors, network/timeouts and invalid acceptance responses map to the existing generic MAIL_UNAVAILABLE error. Requests have a ten-second timeout, reject redirects and do not retry. OTPs, API keys and provider error details are not logged or returned.
- Authentication service/routes, expiry, atomic consumption, resend/attempt/IP limits, sessions and unrelated application modules were unchanged. Updated only mail/configuration tests, the obsolete SMTP test fixture and corresponding setup documentation.
- Verification passed: 81 backend tests (including 25 new delivery/configuration cases), npm run typecheck for all workspaces, direct backend TypeScript build, ESLint for the changed API files, and git diff --check. Existing MongoDB integration tests used isolated temporary databases.
- HTTPS was mocked; no real OTP email was sent, and live Resend acceptance/inbox receipt was not checked. The Render service needs RESEND_API_KEY and artopusindia.com verified in Resend. No local credential file or deployment was modified.

## Render backend build fix - 2026-11-15

- Diagnosed the supplied deployment log: repository checkout succeeded, but the API compile lacked TypeScript's development declarations and Node globals. A production-only install in an isolated temporary copy reproduced the absence of TypeScript and all six required @types packages.
- Verified npm ci --include=dev with NODE_ENV=production restored all seven build packages. Shared and API TypeScript compilation and a syntax check of the compiled server passed in that clean copy, without .env files, database access or email delivery.
- Bounded the root Node engine to >=22.12.0 <23 and synchronized the lockfile, preventing the unbounded range from selecting Node 26. Added docs/RENDER.md with repository-root build/start/health settings and linked it from README.
- Application modules and dependency versions were unchanged. No new tests were added for this installation/configuration fix. The existing Render service still needs its Build Command updated and the local version-range change pushed/redeployed; no remote deployment was performed.
