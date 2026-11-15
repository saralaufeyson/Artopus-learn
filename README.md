# Artopus Learn

The public website is implemented with React/Vite, an Express REST API and MongoDB. It follows the supplied Artopus purple/navy colour direction, supports light and dark modes, and renders published detail pages into HTML during the production build.

The administrator dashboard now supports email OTP sign-in, content editors, publishing/scheduling, media management and site settings. Public demo content remains clearly labeled until replaced. Production SEO/invalidation and deployment work remain in the next phase.

## Start on Windows

Double-click [start-artopus.bat](../start-artopus.bat) in the parent workspace folder. It starts the frontend, API and shared-contract watcher, creates missing local environment files with a generated secret, and installs missing dependencies. Existing configuration is preserved.

MongoDB must be running locally or configured through `apps/api/.env`. The default frontend is http://localhost:5173; the API is http://localhost:4000. Press Ctrl+C in the launcher console to stop the apps.

## Setup and demo content

Use Node.js 22.12+ and npm 9+. Run commands from this directory.

```powershell
npm ci
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Copy examples only when the destination does not already exist. Set `MONGODB_URI` to a running local MongoDB or MongoDB Atlas database, and replace the example `SESSION_SECRET` with a random value of at least 32 characters. The Windows launcher does this first-run setup automatically. Keep server credentials out of `VITE_*` variables.

```powershell
npm run seed:demo
npm run dev
```

On startup the API initializes missing site settings from brand defaults, preserving existing content. The optional demo seed creates sample classes, events, articles and initial site settings. It is disabled in production and uses insert-only upserts, preserving existing records. Every sample record is flagged and displayed as demo content; registration URLs are intentionally absent. Images without an uploaded asset use an explicitly labeled vector illustration. Real student photographs, credentials, results or testimonials are not fabricated.

## Implemented public features

- Settings-driven homepage, featured classes, teaching approach, upcoming/past events, gallery and latest articles.
- Class listings with mode filters; details with objectives, mediums, schedule, fees, instructor, FAQs and external registration when configured.
- Event listings with upcoming/ongoing/completed filters and event-type selection; details with rules, gallery, results and registration deadlines.
- Blog search, categories, featured filtering and URL-backed pagination.
- Article pages with sanitized rich text, image galleries, approved YouTube embeds, related articles and share/copy controls.
- Configurable about/contact information, social channels, class inquiries and shop links.
- Persistent public page-view counter in the footer and top-page totals in the administrator dashboard.
- Loading, empty, error, retry and unpublished-content states.
- Published-data HTML generation, hydration, page-specific titles/descriptions, canonical URLs and basic Open Graph metadata.

Public queries exclude drafts, scheduled/future posts and inactive classes. Featured references use the same visibility rules. Admin routes require an active approved account, a Mongo-backed session and CSRF/origin verification for writes.

## Administrator access

Open http://localhost:5173/admin/login and request a code for an approved account. The sender is contact@artopusindia.com. Set RESEND_API_KEY in apps/api/.env or the Render service environment and verify artopusindia.com in Resend. Delivery uses the HTTPS API; RESEND_API_KEY is required when NODE_ENV=production. No credentials belong in browser variables.

Approve an account using npm run admin:user -- person@example.com "Display name" admin active. Use editor for content-only access or disabled to revoke access. There is no public signup. See [OTP setup and security](docs/AUTHENTICATION.md).

Articles, events and classes support private drafts, saved previews, publication and reversible archival. Articles support scheduled publication; the API checks due records every minute and at startup. Settings manage homepage, featured references, contact/registration/social links and SEO defaults. Class display order is editable. Saves persist in MongoDB; save a draft before navigating away.

Cloudinary credentials enable decoded/optimized image uploads. Images can be reused, annotated and removed from the library when unused; hosted files are retained to protect existing pages. Missing/invalid service credentials produce explicit errors.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch shared contracts and run both apps |
| `npm run dev:web` | Frontend only; real content still needs the API |
| `npm run dev:api` | API only |
| `npm run seed:demo` | Insert labeled demonstration content without overwriting records |
| `npm run typecheck` | Strict TypeScript checks, failing on any workspace error |
| `npm run lint` | ESLint with no warnings allowed |
| `npm test` | API boundary, isolated MongoDB integration and shared contract tests |
| `npm run build` | Compile packages/API and generate public HTML from the running API |
| `npm run check` | Type checks, lint, tests and builds |
| `npm run preview -w @artopus/web` | Preview the production web build locally |
| `npm start -w @artopus/api` | Start the compiled API |

For a single API test: `npm test -w @artopus/api -- src/public.integration.test.ts`.

Integration tests use a uniquely named temporary database on local MongoDB, or on `TEST_MONGODB_URI` when provided. They never use the application database and remove only their own test database.

## Production HTML build

Start the API before running `npm run build`; it must be able to reach MongoDB. The renderer fetches published content and enumerates its real slugs through `/api/v1/content/routes`. It generates the six public landing pages, all visible class/event/article details, an admin-login entry and a 404 document. Query data is safely serialized and hydrated in the browser.

For a different API origin, set `VITE_PRERENDER_API_URL` in the web environment before building, for example `http://127.0.0.1:4000/api/v1`. This is a public-content URL, not a secret.

The current development site remains `noindex, nofollow` with a disallow-all robots.txt while demo content is present. Published-only sitemap generation, production indexing, structured data, responsive image variants and automatic regeneration after publishing/unpublishing remain release gates in Phase 4. Changing MongoDB records does not automatically update an existing static build.

## Architecture and documentation

```text
apps/web/src/      Public/admin views, feature components, query services and routing
apps/web/scripts/ API-backed public HTML generation
apps/api/src/     Express modules, Mongoose models, middleware and demo seed
packages/shared/  Zod contracts, DTOs, safe links and event-date status
docs/             Architecture, API, models, components and theme
```

- [Phased tasks and verification](TASKS.md)
- [Full source tree](docs/STRUCTURE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database models](docs/DATABASE.md)
- [API inventory](docs/API.md)
- [Components](docs/COMPONENTS.md)
- [Colour theme](docs/THEME.md)
- [Contributor instructions](AGENTS.md)

## Deployment

The CMS is implemented; production content regeneration, SEO and deployment gates remain. After the remaining phases pass, host the generated `apps/web/dist` HTML/assets with directory-index support. Keep `dist/server` out of public serving and serve the generated 404 document with a real 404 status. Route API requests to the persistent Node service and configure the admin route fallback separately from public content.

Use HTTPS, an exact production `WEB_ORIGIN`, MongoDB, Cloudinary and a persistent session store. Finalize content-change regeneration, backups and the production indexing policy before release.

## Owner-supplied business content

The site now includes the owner-provided Sasirekha Creations statement, December 2025 class history, student counts, Buds (ages 5–12) and Blossoms (ages 12–18), and the supplied Artopus India YouTube Short. Edit the story, ownership statement and featured video under Site settings; edit the programs under Classes. Clearing the featured video link removes its section. Both-mode classes appear in online and in-person filters.

The explicit npm run content:business command reapplies the supplied copy to the configured database and upserts the two program slugs. It preserves unrelated settings, images, fees, schedules, and registration links; it updates the provided story/class wording and availability. It does not run during startup.

## Page-view counter

The footer shows the total public page views, and the dashboard shows the total plus the ten most viewed paths. Counts start when this feature is enabled; no historic visits are estimated. Reloading a page or returning to it adds a view. Filters, hash changes, theme changes and ordinary re-renders do not. These are page views, not unique visitors.

MongoDB stores one aggregate per canonical public path with its count and timestamps. No visitor profiles, persistent visitor IDs, tracking cookies, query strings or individual browsing histories are stored. Server rendering and builds do not add views. Admin pages, unknown paths and unpublished detail pages are excluded. Historical totals remain when content is withdrawn.

The anonymous count endpoint requires JSON and the configured exact WEB_ORIGIN and allows at most 120 write requests per IP per minute. The limiter uses short-lived server memory; IP addresses are not saved with counts. This is a first-party page-view counter, not bot-proof analytics. Counts require browser JavaScript and a working API; failed tracking requests never interrupt the page or retry a write. All public requests can still browse when counting is limited. No extra environment variables or analytics service are required.
