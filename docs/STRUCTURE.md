# Source structure

Build output, dependencies and local secrets are omitted.

```text
artopus-learn/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  │  ├─ cloudinary.ts
│  │  │  │  ├─ database.ts
│  │  │  │  ├─ env.ts
│  │  │  │  ├─ mail.ts
│  │  │  │  ├─ media-storage.ts
│  │  │  │  └─ session.ts
│  │  │  ├─ lib/
│  │  │  │  ├─ admin-content.ts
│  │  │  │  ├─ api-error.ts
│  │  │  │  ├─ not-implemented.ts
│  │  │  │  ├─ public-content.ts
│  │  │  │  ├─ sanitize-rich-text.test.ts
│  │  │  │  └─ sanitize-rich-text.ts
│  │  │  ├─ middleware/
│  │  │  │  ├─ csrf.ts
│  │  │  │  ├─ error-handler.ts
│  │  │  │  ├─ not-found.ts
│  │  │  │  ├─ require-admin.ts
│  │  │  │  ├─ upload.ts
│  │  │  │  └─ validate.ts
│  │  │  ├─ models/
│  │  │  │  └─ schema-fields.ts
│  │  │  ├─ modules/
│  │  │  │  ├─ admin/
│  │  │  │  │  └─ dashboard.service.ts
│  │  │  │  ├─ analytics/
│  │  │  │  │  ├─ analytics.controller.ts
│  │  │  │  │  ├─ analytics.routes.ts
│  │  │  │  │  ├─ analytics.service.ts
│  │  │  │  │  └─ page-counter.model.ts
│  │  │  │  ├─ auth/
│  │  │  │  │  ├─ admin-user.model.ts
│  │  │  │  │  ├─ auth.controller.ts
│  │  │  │  │  ├─ auth.routes.ts
│  │  │  │  │  ├─ auth.service.ts
│  │  │  │  │  ├─ auth.validation.ts
│  │  │  │  │  └─ otp-challenge.model.ts
│  │  │  │  ├─ blogs/
│  │  │  │  │  ├─ blog.controller.ts
│  │  │  │  │  ├─ blog.model.ts
│  │  │  │  │  ├─ blog.routes.ts
│  │  │  │  │  ├─ blog.service.ts
│  │  │  │  │  ├─ blog.validation.ts
│  │  │  │  │  └─ publish-scheduled.ts
│  │  │  │  ├─ classes/
│  │  │  │  │  ├─ class.controller.ts
│  │  │  │  │  ├─ class.model.ts
│  │  │  │  │  ├─ class.routes.ts
│  │  │  │  │  ├─ class.service.ts
│  │  │  │  │  └─ class.validation.ts
│  │  │  │  ├─ events/
│  │  │  │  │  ├─ event.controller.ts
│  │  │  │  │  ├─ event.model.ts
│  │  │  │  │  ├─ event.routes.ts
│  │  │  │  │  ├─ event.service.ts
│  │  │  │  │  └─ event.validation.ts
│  │  │  │  ├─ media/
│  │  │  │  │  ├─ media.controller.ts
│  │  │  │  │  ├─ media.model.ts
│  │  │  │  │  ├─ media.routes.ts
│  │  │  │  │  ├─ media.service.ts
│  │  │  │  │  └─ media.validation.ts
│  │  │  │  └─ settings/
│  │  │  │     ├─ settings.controller.ts
│  │  │  │     ├─ settings.model.ts
│  │  │  │     ├─ settings.routes.ts
│  │  │  │     ├─ settings.service.ts
│  │  │  │     └─ settings.validation.ts
│  │  │  ├─ scripts/
│  │  │  │  ├─ admin-user.ts
│  │  │  │  ├─ apply-business-content.ts
│  │  │  │  └─ seed-demo.ts
│  │  │  ├─ admin.integration.test.ts
│  │  │  ├─ analytics.integration.test.ts
│  │  │  ├─ app.test.ts
│  │  │  ├─ app.ts
│  │  │  ├─ public.integration.test.ts
│  │  │  ├─ routes.ts
│  │  │  └─ server.ts
│  │  ├─ .env.example
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ web/
│     ├─ public/
│     │  ├─ robots.txt
│     │  └─ theme-init.js
│     ├─ scripts/
│     │  └─ prerender.mjs
│     ├─ src/
│     │  ├─ components/
│     │  │  ├─ content/
│     │  │  │  ├─ ContentCard.tsx
│     │  │  │  ├─ FeaturedVideo.tsx
│     │  │  │  ├─ FeatureNotice.tsx
│     │  │  │  ├─ PageSkeleton.tsx
│     │  │  │  ├─ PublicPrimitives.tsx
│     │  │  │  ├─ QueryState.tsx
│     │  │  │  └─ StudioArtwork.tsx
│     │  │  ├─ navigation/
│     │  │  │  ├─ Pagination.tsx
│     │  │  │  ├─ SiteFooter.tsx
│     │  │  │  └─ SiteHeader.tsx
│     │  │  └─ ui/
│     │  │     ├─ Button.tsx
│     │  │     ├─ EmptyState.tsx
│     │  │     ├─ ErrorState.tsx
│     │  │     ├─ ImagePlaceholder.tsx
│     │  │     ├─ LoadingState.tsx
│     │  │     └─ ThemeToggle.tsx
│     │  ├─ features/
│     │  │  ├─ admin/
│     │  │  │  ├─ ContentEditor.tsx
│     │  │  │  ├─ ContentList.tsx
│     │  │  │  ├─ editor-config.ts
│     │  │  │  └─ EditorFields.tsx
│     │  │  ├─ auth/
│     │  │  │  ├─ components/
│     │  │  │  │  └─ LoginForm.tsx
│     │  │  │  ├─ hooks/
│     │  │  │  │  └─ useAdminSession.ts
│     │  │  │  └─ services/
│     │  │  │     └─ auth.service.ts
│     │  │  ├─ blogs/
│     │  │  │  ├─ components/
│     │  │  │  │  ├─ BlogCard.tsx
│     │  │  │  │  ├─ BlogForm.tsx
│     │  │  │  │  ├─ RichTextEditor.tsx
│     │  │  │  │  └─ ShareArticle.tsx
│     │  │  │  ├─ hooks/
│     │  │  │  │  └─ useBlogs.ts
│     │  │  │  └─ services/
│     │  │  │     └─ blogs.service.ts
│     │  │  ├─ classes/
│     │  │  │  ├─ components/
│     │  │  │  │  ├─ ClassCard.tsx
│     │  │  │  │  └─ ClassForm.tsx
│     │  │  │  ├─ hooks/
│     │  │  │  │  └─ useClasses.ts
│     │  │  │  └─ services/
│     │  │  │     └─ classes.service.ts
│     │  │  ├─ events/
│     │  │  │  ├─ components/
│     │  │  │  │  ├─ EventCard.tsx
│     │  │  │  │  └─ EventForm.tsx
│     │  │  │  ├─ hooks/
│     │  │  │  │  └─ useEvents.ts
│     │  │  │  └─ services/
│     │  │  │     └─ events.service.ts
│     │  │  ├─ media/
│     │  │  │  ├─ components/
│     │  │  │  │  └─ MediaPicker.tsx
│     │  │  │  └─ services/
│     │  │  │     └─ media.service.ts
│     │  │  └─ settings/
│     │  │     ├─ components/
│     │  │     │  └─ SettingsForm.tsx
│     │  │     ├─ hooks/
│     │  │     │  └─ useSiteSettings.ts
│     │  │     └─ services/
│     │  │        └─ settings.service.ts
│     │  ├─ hooks/
│     │  │  ├─ useColorTheme.ts
│     │  │  └─ useDocumentTitle.ts
│     │  ├─ layouts/
│     │  │  ├─ AdminLayout.tsx
│     │  │  └─ PublicLayout.tsx
│     │  ├─ pages/
│     │  │  ├─ admin/
│     │  │  │  ├─ BlogEditorPage.tsx
│     │  │  │  ├─ BlogListPage.tsx
│     │  │  │  ├─ ClassEditorPage.tsx
│     │  │  │  ├─ ClassListPage.tsx
│     │  │  │  ├─ DashboardPage.tsx
│     │  │  │  ├─ EventEditorPage.tsx
│     │  │  │  ├─ EventListPage.tsx
│     │  │  │  ├─ LoginPage.tsx
│     │  │  │  ├─ MediaLibraryPage.tsx
│     │  │  │  └─ SettingsPage.tsx
│     │  │  ├─ public/
│     │  │  │  ├─ AboutPage.tsx
│     │  │  │  ├─ BlogDetailPage.tsx
│     │  │  │  ├─ BlogPage.tsx
│     │  │  │  ├─ ClassDetailPage.tsx
│     │  │  │  ├─ ClassesPage.tsx
│     │  │  │  ├─ ContactPage.tsx
│     │  │  │  ├─ EventDetailPage.tsx
│     │  │  │  ├─ EventsPage.tsx
│     │  │  │  └─ HomePage.tsx
│     │  │  └─ NotFoundPage.tsx
│     │  ├─ routes/
│     │  │  ├─ AppRoutes.tsx
│     │  │  ├─ paths.ts
│     │  │  └─ ProtectedAdminRoute.tsx
│     │  ├─ services/
│     │  │  ├─ api-client.ts
│     │  │  └─ public-queries.ts
│     │  ├─ styles/
│     │  │  └─ index.css
│     │  ├─ App.tsx
│     │  ├─ entry-server.tsx
│     │  └─ main.tsx
│     ├─ .env.example
│     ├─ index.html
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ docs/
│  ├─ API.md
│  ├─ ARCHITECTURE.md
│  ├─ AUTHENTICATION.md
│  ├─ COMPONENTS.md
│  ├─ DATABASE.md
│  ├─ STRUCTURE.md
│  └─ THEME.md
├─ packages/
│  └─ shared/
│     ├─ src/
│     │  ├─ schemas/
│     │  │  ├─ auth.schema.ts
│     │  │  ├─ blog.schema.ts
│     │  │  ├─ class.schema.ts
│     │  │  ├─ common.schema.ts
│     │  │  ├─ contracts.test.ts
│     │  │  ├─ event.schema.ts
│     │  │  ├─ media.schema.ts
│     │  │  ├─ public-query.schema.ts
│     │  │  └─ settings.schema.ts
│     │  ├─ types/
│     │  │  ├─ api.ts
│     │  │  └─ content.ts
│     │  ├─ utils/
│     │  │  ├─ event-status.test.ts
│     │  │  ├─ event-status.ts
│     │  │  ├─ safe-href.test.ts
│     │  │  ├─ safe-href.ts
│     │  │  ├─ youtube-video.test.ts
│     │  │  └─ youtube-video.ts
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
├─ scripts/
│  └─ run-checks.mjs
├─ .editorconfig
├─ .env.example
├─ .gitignore
├─ AGENTS.md
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ TASKS.md
└─ tsconfig.base.json
```

Page-view additions also include web features/analytics/page-views.ts, components/navigation/PageViewCounter.tsx, components/admin/PageViewAnalytics.tsx and shared schemas/analytics.schema.ts with its contract tests.
