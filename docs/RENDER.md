# Render backend deployment

Run the API as a Node Web Service from the repository root (the folder containing the root package.json, package-lock.json, apps and packages). Leave Render's Root Directory empty.

| Render setting | Value |
| --- | --- |
| Build Command | `npm ci --include=dev && npm run build -w @artopus/shared && npm run build -w @artopus/api` |
| Start Command | `npm start -w @artopus/api` |
| Health Check Path | `/health/ready` |

The API build compiles TypeScript. Its compiler and declaration packages (@types/node, @types/express, @types/cors, @types/express-session, @types/multer and @types/sanitize-html) are development dependencies. npm normally omits these when NODE_ENV=production. Explicit --include=dev installs them during the build while keeping the service in production mode. See [npm ci configuration](https://docs.npmjs.com/cli/v10/commands/npm-ci/).

The package engine range selects Node 22.12 or later within 22.x, matching the development major version. Remove any Render NODE_VERSION override that selects Node 26, or set a compatible 22.x version. Render environment overrides take precedence over package.json. See [Render Node version selection](https://render.com/docs/node-version).

Keep NODE_ENV=production. Configure MONGODB_URI (or MONGO_URI), WEB_ORIGIN (the exact HTTPS frontend origin), SESSION_SECRET and RESEND_API_KEY on the service. Configure Cloudinary separately for uploads. Use the proxy setting described in [authentication setup](AUTHENTICATION.md) for the actual hosting topology. The API reads Render's assigned PORT. Do not upload the local .env file.

After pushing the version-range change, update the existing service's build command, then redeploy the latest commit. A successful backend build compiles @artopus/shared followed by @artopus/api without building the frontend or contacting MongoDB. Startup then validates configuration and connects to MongoDB; /health/ready returns 200 only after that succeeds.

## Missing type declarations during build

The reported TS7016 errors for Express/CORS/session/Multer/sanitize-html and missing Node globals (process, Buffer, fetch, AbortSignal and timers) point to omitted development dependencies. Restore them at install time; the declaration packages already exist in the API manifest. Keep strict TypeScript checks enabled.

The initial repository-access warning in the supplied log was followed by a successful checkout of commit 358a702 and execution of the build. The failure shown in that log occurred later during TypeScript compilation.

## Frontend API routing

The production frontend is https://learn.artopusindia.com and the Render API custom domain is https://api.learn.artopusindia.com. The repository's apps/web/.env.production contains only these public build settings:

```dotenv
VITE_API_BASE_URL=https://api.learn.artopusindia.com/api/v1
VITE_PRERENDER_API_URL=https://api.learn.artopusindia.com/api/v1
VITE_SITE_URL=https://learn.artopusindia.com
```

Keep WEB_ORIGIN=https://learn.artopusindia.com on the Render backend. The custom API domain keeps browser requests on the same HTTPS site as the frontend while the existing credentialed CORS policy allows that exact frontend origin. The API client already includes cookies; the existing Secure/HTTP-only/SameSite=Lax session settings remain in use.

Set the same VITE values on the frontend hosting service if it defines build-time environment variables. In particular, replace an existing VITE_API_BASE_URL=/api/v1 setting there: hosting environment values override .env.production. Rebuild and redeploy the frontend after changing them because Vite embeds these values in its JavaScript bundle. See [Vite environment priorities](https://vite.dev/guide/env-and-mode#env-files).

For a frontend build from the repository root, use:

```sh
npm ci --include=dev && npm run build -w @artopus/shared && npm run build -w @artopus/web
```

Publish apps/web/dist and keep dist/server out of public serving. Prerendering reads published public content from the custom API URL. Local development continues to read the existing apps/web/.env and uses the Vite /api proxy.

If a POST to https://learn.artopusindia.com/api/v1/analytics/page-views returns 405 and GET requests to /api/v1/settings return the homepage HTML, the old frontend bundle is still using a relative API URL without a production proxy. Requests from the corrected bundle should target https://api.learn.artopusindia.com/api/v1/... instead.
