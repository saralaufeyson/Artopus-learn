import { describe, expect, it } from 'vitest';
import { pageViewInputSchema } from './analytics.schema.js';
describe('page-view privacy and path boundaries', () => {
  it('accepts only canonical public routes', () => {
    for (const path of ['/', '/about', '/contact', '/blog', '/events', '/classes', '/blog/our-studio', '/events/pot-painting', '/classes/buds']) {
      expect(pageViewInputSchema.safeParse({ path }).success).toBe(true);
    }
  });
  it('rejects private routes, arbitrary URLs, fragments, queries and oversized paths', () => {
    for (const path of ['/admin', '/admin/login', '//example.com', 'https://example.com/', '/blog?email=person@example.com', '/about#story', '/contact/', '/classes/../admin', '/blog/%2e%2e', '/missing', '/blog/' + 'a'.repeat(170)]) {
      expect(pageViewInputSchema.safeParse({ path }).success).toBe(false);
    }
  });
  it('does not accept visitor identifiers or extra personal information', () => {
    expect(pageViewInputSchema.safeParse({ path: '/', email: 'person@example.com' }).success).toBe(false);
    expect(pageViewInputSchema.safeParse({ path: '/', visitorId: 'persistent-id' }).success).toBe(false);
  });
});
