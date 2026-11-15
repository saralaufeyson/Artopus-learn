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
