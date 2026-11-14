# Repository Guidelines

## Project Structure & Module Organization

This npm-workspaces monorepo implements the requirements in `../instructions.txt`. Work incrementally and keep `TASKS.md` current. The public website and admin CMS are implemented. OTP login replaces password login at the user's request. Production HTML invalidation, sitemap/indexing and deployment remain pending.

`apps/web` owns browser views, public/admin layouts and feature-specific query services. `apps/api` owns Express routing and Mongoose persistence. Each API module separates routes, controllers, services, validation and its model. `packages/shared` exports Zod input contracts, serializable DTOs and the event-date utility; it must not import server or browser code. Shared exports resolve through its compiled `dist`, so build it before consumers.

## Build, Test, and Development Commands

Run commands from this directory. `npm ci` installs locked dependencies. `npm run dev` watches contracts and starts both apps; `npm run dev:web` works without MongoDB. `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` are the phase checks; `npm run check` runs all four. Run an individual API test with `npm test -w @artopus/api -- src/app.test.ts`.

## Coding Style & Naming Conventions

TypeScript uses strict mode and unchecked-index protection. ESLint enforces the TypeScript recommended rules and React hooks rules. EditorConfig specifies two spaces, UTF-8 and LF. Use PascalCase for React components, camelCase for hooks and kebab/dotted names for API files. Server/shared ESM imports use emitted `.js` paths.

## Testing Guidelines

Vitest covers shared contracts, the event timeline, API boundaries, OTP/session security and CMS workflows. Supertest boundary tests need no database; public.integration.test.ts uses a uniquely named temporary MongoDB database. Add real database integration checks when persistence is implemented; report unavailable services explicitly. Build-time public rendering needs the API running. No numeric coverage threshold is configured.

## Security and Content Boundaries

Admin middleware checks Mongo-backed sessions and current account roles/status; all mutations require session-bound CSRF and an exact Origin. Keep missing SMTP/session configuration fail closed. Never introduce an OTP bypass or log codes. Never use localStorage for authentication. Treat shared validation as input validation, not HTML sanitization. Keep secrets out of `VITE_*` variables. Public pages must exclude unpublished records. Maintain noindex until real detail-page rendering and sitemap visibility checks pass. Use verified business content only.
