# Database design

Mongoose models live in apps/api/src/modules; shared Zod contracts live in packages/shared/src/schemas. Content models use strict schemas, timestamps, unique slugs and publication indexes. Rich text is sanitized on writes and public responses. Duplicate slugs map to 409.

| Model | Purpose |
| --- | --- |
| BlogPost | Articles, author/category/tags, media, SEO, draft/scheduled/published/archived states, publication/schedule dates |
| Event | Event details, dates, location, registration, rules/results, poster/gallery and draft/published/archived status |
| ClassOffering | Class details, age/mode, objectives, mediums, instructor/FAQs, registration, status and displayOrder |
| MediaAsset | Cloudinary public ID, URL, optimized MIME/size, alt text, createdAt and removedAt |
| SiteSettings | Singleton site brand, hero/about, benefits, featured references, gallery, CTA, registration/contact/social and SEO |
| AdminUser | Normalized unique email, name, admin/editor role, active/disabled status; optional unused legacy passwordHash |
| PageCounter | One document per canonical public path (_id); atomic views count, first-count and last-count timestamps; no visitor identifiers |
| OtpChallenge | HMAC digests, browser binding, opaque challenge ID, code expiry, attempts, consumption, resend/hour limits and TTL cleanup |

Mongo-backed sessions use admin_sessions with expiration. Codes expire after five minutes; challenge rate-limit records are retained for a day and purged with a TTL index. Expiry is explicitly checked even before TTL removal.

The administrator CLI approves or disables accounts. Every protected request reloads status and role from MongoDB. Passwordless OTP replaces password login at the user's request.

Event date status is computed separately from publication: before start is upcoming, start through end inclusive is ongoing, after end is completed. Store UTC; the admin form converts local date/time to UTC.

Fees are optional INR amounts, including zero for free. Gallery/cover/poster/thumbnail/settings images reference MediaAsset IDs. Rich-text images use hosted URLs. Uploads must decode as JPEG/PNG/WebP, have at most 40 million pixels and be under 10 MiB. Sharp strips metadata and emits WebP up to 2400px. Alternative text is required.

Library removal checks references across content and settings, sets removedAt, and retains the hosted object. This avoids breaking concurrent edits, previously rendered pages, or external references. Removed assets cannot be newly selected through ordinary media fields. Physical Cloudinary cleanup needs an explicit retention/rebuild policy.

Scheduled articles are atomically promoted by the persistent API process at startup and once per minute. Recent dashboard activity derives from actual content updatedAt values; it is a recent-edits view, not a complete audit log.

Integration tests use separately named temporary databases and guard database cleanup by the exact generated name. Never run destructive cleanup against application databases.

SiteSettings now includes optional branding.ownershipStatement and featuredVideo { title, description?, url }. The shared contract accepts supported HTTPS YouTube video links only. Both-mode class offerings retain classMode=hybrid while public online/offline filters include them, with a clearer public label.

PageCounter uses MongoDB's unique string _id for each path; concurrent first visits and increments use one atomic upsert. The all-time total is the sum of these counters. Counts survive API restarts and publication withdrawal. No historical traffic is imported or invented. Rate-limit IP keys are held temporarily in application memory, not in MongoDB.
