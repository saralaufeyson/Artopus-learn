# Architecture

npm workspaces coordinate React/Vite, Express/Mongoose and a browser-safe shared Zod package. Controllers own HTTP concerns; module services own validation, persistence, publication and reference rules. Shared validation is built before its consumers.

The public app uses React Router and TanStack Query. Admin list/editor modules load on demand, keeping TipTap out of the initial public bundle. Admin editing uses React Hook Form and Zod and persists through protected REST APIs.

OTP authentication sends through authorized SMTP as contact@artopusindia.com. Codes are HMAC-hashed and bound to anonymous Mongo-backed sessions. Successful verification rotates the session ID; authorization checks current database status/role on every request. Server-side CSRF and exact-Origin checks protect every mutation. See [authentication](AUTHENTICATION.md).

Media is decoded and optimized by Sharp, then uploaded to Cloudinary with server-generated IDs. Stored media references are validated. Removal from the library retains the physical object and protects in-use assets. Secrets stay server-side.

The API catches up scheduled publications on startup and promotes due records each minute. Updates are atomic and safe across overlapping timer runs. The API must remain running for timely scheduling. Dashboard recent activity is derived from content updatedAt.

The web production build renders public pages and published detail routes using the API, then hydrates the serialized query data. Private drafts are never included. Noindex remains enabled. Existing static HTML needs rebuilding after edits, publishing, scheduling or unpublication; automatic invalidation, sitemap/structured data and host-level HTTP 404 handling remain Phase 4 gates.

Local development uses the Windows launcher or npm run dev. Environment aliases support MONGO_URI, SMTP_USERNAME and SMTP_PASSWORD while preserving canonical example names. The check runner invokes package scripts directly and propagates child failures, avoiding npm 9 workspace exit-code masking on Windows.

Generated HTML records its rendered path. The client hydrates only a matching unfiltered document; direct admin SPA fallbacks and query-filter URLs mount fresh views. This avoids hydrating homepage markup as a different route. Hosting-level public 404 and invalidation rules still need production configuration.
