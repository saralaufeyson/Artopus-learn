# Frontend components

The public views use shared semantic theme tokens, PublicPrimitives, StudioArtwork, QueryState, Pagination, ShareArticle and typed class/event/article cards. Public settings drive navigation, footer content and registration links. Missing imagery stays clearly labeled.

Administrator pages load separately from the public bundle. ProtectedAdminRoute checks the HTTP-only session. AdminLayout provides role-aware navigation, theme switching and sign-out. LoginForm implements email and code steps with loading/error states, resend countdown and automatic completion attributes.

ContentList provides search, status filtering, pagination and reversible archival. ContentEditor shares React Hook Form, Zod validation, saved-state notifications and reload protection across articles, events, classes and settings. EditorFields supplies labeled inputs, date/time conversion, repeatable FAQs/benefits, image selection, featured references and SEO fields. Every save persists in MongoDB; failed saves preserve form values.

RichTextEditor uses TipTap for headings, emphasis, lists, quotes, links, images from the media library and approved YouTube embeds. Saved private previews are sanitized on the server. MediaLibraryPage uploads optimized images, edits alternative text and protects referenced files. MediaPicker reuses paginated existing images.

Publication status is explicit. Save as draft hides public content; Save changes applies the selected status. Blog scheduling requires a future local date/time, converted to UTC on submission. Class order is a numeric display-order field. Browser drafts are not stored in localStorage; use Save as draft before navigating away.

FeaturedVideo renders CMS video copy on the homepage/About page, using the shared YouTube URL parser. Shorts get a portrait preview; the iframe loads on Play and always uses youtube-nocookie.com. Invalid/unsupported video URLs are rejected by the shared contract. Ownership copy is editable in branding and rendered in the footer.

PublicLayout calls useTrackPageView after browser mount. Its deferred effect avoids development StrictMode double counting; it depends only on the canonical pathname. PageViewCounter fetches a live aggregate for the footer, with loading/unavailable states instead of an invented count. PageViewAnalytics renders the dashboard total and accessible top-pages table. Failed tracking is silent and never blocks content. Static rendering keeps the counter as a placeholder until browser hydration.
