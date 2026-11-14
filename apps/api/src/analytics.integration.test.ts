import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { PageCounter } from './modules/analytics/page-counter.model.js';
import { analyticsService } from './modules/analytics/analytics.service.js';
import { BlogPost } from './modules/blogs/blog.model.js';
import { Event } from './modules/events/event.model.js';
import { ClassOffering } from './modules/classes/class.model.js';
const database = 'artopus_test_' + randomUUID().replaceAll('-', '');
const origin = 'http://localhost:5173';
const app = createApp({ webOrigin: origin, trustProxyHops: 1 });
function visit(path: string) {
  return request(app).post('/api/v1/analytics/page-views').set('Origin', origin).set('X-Forwarded-For', '10.45.0.1').send({ path });
}
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', { dbName: database, serverSelectionTimeoutMS: 5000 });
  await PageCounter.init();
  const now = Date.now();
  await BlogPost.create([
    { title: 'Published', slug: 'published', category: 'Art', author: 'Test', status: 'published', publishedAt: new Date(now - 10000) },
    { title: 'Draft', slug: 'draft', category: 'Art', author: 'Test', status: 'draft' },
    { title: 'Future', slug: 'future', category: 'Art', author: 'Test', status: 'published', publishedAt: new Date(now + 86400000) },
    { title: 'Scheduled', slug: 'scheduled', category: 'Art', author: 'Test', status: 'scheduled', scheduledAt: new Date(now + 86400000) },
  ]);
  const event = { title: 'Event', description: 'Test', eventType: 'workshop', locationType: 'online', startDate: new Date(now), endDate: new Date(now + 86400000) };
  await Event.create([{ ...event, slug: 'published', status: 'published' }, { ...event, slug: 'draft', status: 'draft' }]);
  const program = { title: 'Class', description: 'Test', ageGroup: '5–12', classMode: 'hybrid' };
  await ClassOffering.create([{ ...program, slug: 'active', status: 'active' }, { ...program, slug: 'inactive', status: 'inactive' }]);
}, 15000);
beforeEach(async () => { await PageCounter.deleteMany({}); });
afterAll(async () => {
  if (mongoose.connection.name === database) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
describe('persistent public page-view counts', () => {
  it('starts at zero, exposes only the total and never counts read requests', async () => {
    for (let i = 0; i < 2; i++) {
      const result = await request(app).get('/api/v1/analytics/page-views');
      expect(result.status).toBe(200);
      expect(result.body.data).toEqual({ total: 0 });
      expect(result.headers['cache-control']).toBe('no-store');
      expect(result.headers['set-cookie']).toBeUndefined();
    }
    expect(await PageCounter.countDocuments()).toBe(0);
  });
  it('counts all public page types and persists across application instances', async () => {
    const paths = ['/', '/about', '/contact', '/blog', '/events', '/classes', '/blog/published', '/events/published', '/classes/active'];
    for (const path of paths) {
      const result = await visit(path);
      expect(result.status).toBe(200);
      expect(result.headers['set-cookie']).toBeUndefined();
    }
    const secondApp = createApp({ webOrigin: origin });
    expect((await request(secondApp).get('/api/v1/analytics/page-views')).body.data).toEqual({ total: paths.length });
    expect(await PageCounter.countDocuments()).toBe(paths.length);
    const record = await PageCounter.findById('/about').lean();
    expect(Object.keys(record!).sort()).toEqual(['__v', '_id', 'createdAt', 'updatedAt', 'views'].sort());
  });
  it('does not lose concurrent first visits or repeated reloads', async () => {
    const responses = await Promise.all(Array.from({ length: 40 }, () => visit('/contact')));
    expect(responses.every(response => response.status === 200)).toBe(true);
    expect((await visit('/contact')).body.data.total).toBe(41);
    expect(await PageCounter.countDocuments()).toBe(1);
    expect((await PageCounter.findById('/contact').lean())?.views).toBe(41);
  });
  it('rejects unavailable, private and unpublished detail pages without changing totals', async () => {
    for (const path of ['/blog/missing', '/blog/draft', '/blog/future', '/blog/scheduled', '/events/draft', '/classes/inactive']) {
      expect((await visit(path)).status).toBe(404);
    }
    for (const path of ['/admin', '/admin/login', '/admin/blogs/new', '/missing']) expect((await visit(path)).status).toBe(400);
    expect((await analyticsService.total()).total).toBe(0);
  });
  it('retains historical totals when published content is later withdrawn', async () => {
    expect((await visit('/blog/published')).status).toBe(200);
    await BlogPost.updateOne({ slug: 'published' }, { status: 'draft' });
    try {
      expect((await visit('/blog/published')).status).toBe(404);
      expect((await analyticsService.total()).total).toBe(1);
    } finally { await BlogPost.updateOne({ slug: 'published' }, { status: 'published' }); }
  });
  it('returns the leading ten pages while retaining the complete total', async () => {
    await PageCounter.insertMany(Array.from({ length: 12 }, (_, i) => ({ _id: '/blog/page-' + (i + 1), views: i + 1 })));
    const summary = await analyticsService.summary();
    expect(summary.total).toBe(78);
    expect(summary.pages).toHaveLength(10);
    expect(summary.pages[0]).toEqual({ path: '/blog/page-12', views: 12 });
    expect(summary.pages[9]).toEqual({ path: '/blog/page-3', views: 3 });
    expect((await request(app).get('/api/v1/analytics/page-views')).body.data).toEqual({ total: 78 });
  });
  it('bounds count-write traffic without affecting page browsing', async () => {
    for (let i = 0; i < 120; i++) {
      const result = await request(app).post('/api/v1/analytics/page-views').set('Origin', origin).set('X-Forwarded-For', '10.45.0.99').send({ path: '/admin' });
      expect(result.status).toBe(400);
    }
    const rejected = await request(app).post('/api/v1/analytics/page-views').set('Origin', origin).set('X-Forwarded-For', '10.45.0.99').send({ path: '/' });
    expect(rejected.status).toBe(429);
    expect(rejected.body.error.code).toBe('RATE_LIMITED');
    expect((await request(app).get('/api/v1/analytics/page-views')).status).toBe(200);
    expect(await PageCounter.countDocuments()).toBe(0);
  });
});
