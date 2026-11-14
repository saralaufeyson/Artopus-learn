import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { BlogPost } from './modules/blogs/blog.model.js';
import { Event } from './modules/events/event.model.js';
import { ClassOffering } from './modules/classes/class.model.js';
import { SiteSettings } from './modules/settings/settings.model.js';
const database = 'artopus_test_' + randomUUID().replaceAll('-', '');
const app = createApp({ webOrigin: 'http://localhost:5173' });
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', { dbName: database, serverSelectionTimeoutMS: 5000 });
  const now = Date.now();
  await BlogPost.create([
    { title: 'Visible art story', slug: 'visible-story', category: 'Art', author: 'Test', status: 'published', publishedAt: new Date(now - 10000), featured: true, content: '<h2>Safe heading</h2><script>alert(1)</script><a href="javascript:alert(1)">unsafe</a><img src="https://example.com/art.png" onerror="alert(1)">' },
    { title: 'Another art story', slug: 'related-story', category: 'Art', author: 'Test', status: 'published', publishedAt: new Date(now - 20000) },
    { title: 'Hidden draft', slug: 'hidden-draft', category: 'Secret', author: 'Test', status: 'draft' },
    { title: 'Future story', slug: 'future-story', category: 'Secret', author: 'Test', status: 'published', publishedAt: new Date(now + 86400000) },
    { title: 'Scheduled story', slug: 'scheduled-story', category: 'Secret', author: 'Test', status: 'scheduled', scheduledAt: new Date(now - 10000) },
  ]);
  const baseEvent = { description: 'Test', eventType: 'workshop', locationType: 'online', location: 'Test', status: 'published' };
  await Event.create([
    { ...baseEvent, title: 'Ongoing', slug: 'ongoing-event', startDate: new Date(now - 86400000), endDate: new Date(now + 86400000) },
    { ...baseEvent, title: 'Upcoming', slug: 'upcoming-event', startDate: new Date(now + 86400000), endDate: new Date(now + 172800000) },
    { ...baseEvent, title: 'Past', slug: 'past-event', startDate: new Date(now - 172800000), endDate: new Date(now - 86400000) },
    { ...baseEvent, title: 'Draft', slug: 'draft-event', status: 'draft', startDate: new Date(now - 172800000), endDate: new Date(now - 86400000) },
  ]);
  const active = await ClassOffering.create({ title: 'Active class', slug: 'active-class', description: 'Test', ageGroup: 'Test', classMode: 'online', status: 'active' });
  const hidden = await ClassOffering.create({ title: 'Inactive class', slug: 'inactive-class', description: 'Test', ageGroup: 'Test', classMode: 'offline', status: 'inactive' });
  await SiteSettings.create({ key: 'site', featuredContent: { classes: [active._id, hidden._id] }, aboutSection: { content: '<p>Safe</p><script>bad()</script>' } });
}, 15000);
afterAll(async () => {
  if (mongoose.connection.name === database) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
describe('public content against an isolated MongoDB database', () => {
  it('excludes drafts, scheduled and future posts from listings and categories', async () => {
    const result = await request(app).get('/api/v1/blogs');
    expect(result.status).toBe(200);
    expect(result.body.data.total).toBe(2);
    expect((await request(app).get('/api/v1/blogs/categories')).body.data).toEqual(['Art']);
  });
  it.each(['hidden-draft', 'future-story', 'scheduled-story'])('returns 404 for unpublished slug %s', async slug => {
    expect((await request(app).get('/api/v1/blogs/' + slug)).status).toBe(404);
  });
  it('paginates, searches literally and filters featured posts', async () => {
    const result = await request(app).get('/api/v1/blogs?page=2&limit=1');
    expect(result.body.data.items).toHaveLength(1);
    expect(result.body.data.total).toBe(2);
    expect((await request(app).get('/api/v1/blogs?search=.*')).body.data.total).toBe(0);
    expect((await request(app).get('/api/v1/blogs?featured=true')).body.data.total).toBe(1);
  });
  it('sanitizes rich text and returns only visible related articles', async () => {
    const result = await request(app).get('/api/v1/blogs/visible-story');
    expect(result.body.data.content).toContain('<h2>Safe heading</h2>');
    expect(result.body.data.content).not.toMatch(/<script|javascript:|onerror/i);
    expect(result.body.data.related.map((post: { slug: string }) => post.slug)).toEqual(['related-story']);
    expect(result.body.data.id).toBeTypeOf('string');
    expect(result.body.data._id).toBeUndefined();
  });
  it.each([['ongoing', 'ongoing-event'], ['upcoming', 'upcoming-event'], ['completed', 'past-event']])('derives %s event status without exposing drafts', async (status, slug) => {
    const result = await request(app).get('/api/v1/events?status=' + status);
    expect(result.body.data.total).toBe(1);
    expect(result.body.data.items[0].slug).toBe(slug);
  });
  it('exposes only active classes and filters private featured references', async () => {
    expect((await request(app).get('/api/v1/classes')).body.data.total).toBe(1);
    expect((await request(app).get('/api/v1/classes/inactive-class')).status).toBe(404);
    const result = await request(app).get('/api/v1/settings');
    expect(result.body.data.featuredContent.classes).toHaveLength(1);
    expect(result.body.data.aboutSection.content).not.toContain('script');
  });
  it('enumerates only visible content for public HTML generation', async () => {
    const routes = (await request(app).get('/api/v1/content/routes')).body.data.map((item: { path: string }) => item.path);
    expect(routes).toContain('/blog/visible-story');
    expect(routes).not.toContain('/blog/hidden-draft');
    expect(routes).not.toContain('/blog/future-story');
    expect(routes).not.toContain('/events/draft-event');
    expect(routes).not.toContain('/classes/inactive-class');
  });
  it('includes classes offered in both modes in online and in-person filters', async () => {
    const both = await ClassOffering.create({ title: 'Both modes', slug: 'both-modes', description: 'Owner-confirmed classes', ageGroup: '5–12', classMode: 'hybrid', status: 'active' });
    try {
      for (const mode of ['online', 'offline', 'hybrid']) {
        const response = await request(app).get('/api/v1/classes?mode=' + mode);
        expect(response.status).toBe(200);
        expect(response.body.data.items.map((item: { slug: string }) => item.slug)).toContain('both-modes');
        expect(response.body.data.items.map((item: { slug: string }) => item.slug)).not.toContain('inactive-class');
      }
    } finally { await ClassOffering.deleteOne({ _id: both._id }); }
  });
  it('rejects invalid pagination before querying', async () => {
    expect((await request(app).get('/api/v1/blogs?page=-1')).status).toBe(400);
    expect((await request(app).get('/api/v1/events?limit=1000')).status).toBe(400);
  });
});
