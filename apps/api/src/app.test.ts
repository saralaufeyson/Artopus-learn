import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
const app = createApp({ webOrigin: 'http://localhost:5173' });
describe('API authentication boundaries', () => {
  it('reports liveness without pretending MongoDB is ready', async () => {
    expect((await request(app).get('/health')).status).toBe(200);
    expect((await request(app).get('/health/ready')).status).toBe(503);
  });
  it.each(['blogs', 'events', 'classes', 'media', 'settings', 'dashboard'])('blocks anonymous admin access to %s', async (module) => {
    const result = await request(app).get('/api/v1/admin/' + module);
    expect(result.status).toBe(401);
    expect(result.body.error.code).toBe('UNAUTHENTICATED');
  });
  it('does not accept anonymous content writes', async () => {
    expect((await request(app).post('/api/v1/admin/blogs').send({ title: 'test' })).status).toBe(401);
  });
  it('validates public query parameters before database access', async () => {
    const result = await request(app).get('/api/v1/blogs?page=-1');
    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_ERROR');
  });
  it('validates login input and never creates a fake session', async () => {
    expect((await request(app).post('/api/v1/auth/login').send({})).status).toBe(400);
    const result = await request(app).post('/api/v1/auth/login').send({ email: 'editor@example.com', password: 'example' });
    expect(result.status).toBe(403);
    expect(result.headers['set-cookie']).toBeUndefined();
  });
  it('rejects cross-origin and non-JSON page-view writes before database access', async () => {
    expect((await request(app).post('/api/v1/analytics/page-views').send({ path: '/' })).status).toBe(403);
    expect((await request(app).post('/api/v1/analytics/page-views').set('Origin', 'https://attacker.example').send({ path: '/' })).status).toBe(403);
    expect((await request(app).post('/api/v1/analytics/page-views').set('Origin', 'http://localhost:5173').type('form').send({ path: '/' })).status).toBe(415);
    const invalid = await request(app).post('/api/v1/analytics/page-views').set('Origin', 'http://localhost:5173').send({ path: '/blog?email=private@example.com' });
    expect(invalid.status).toBe(400);
    expect(invalid.headers['set-cookie']).toBeUndefined();
  });
  it('returns a consistent 404', async () => {
    expect((await request(app).get('/missing')).body.error.code).toBe('NOT_FOUND');
  });
});
