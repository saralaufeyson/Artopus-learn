import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createSessionMiddleware } from './config/session.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { AdminUser } from './modules/auth/admin-user.model.js';
import { OtpChallenge } from './modules/auth/otp-challenge.model.js';
import { BlogPost } from './modules/blogs/blog.model.js';
import { MediaAsset } from './modules/media/media.model.js';
import { publishScheduledBlogs } from './modules/blogs/publish-scheduled.js';
import { loadEnv } from './config/env.js';
import { ApiError } from './lib/api-error.js';
const database = 'artopus_test_' + randomUUID().replaceAll('-', '');
const origin = 'http://localhost:5173';
const codes = new Map<string, string>();
let failDelivery = false;
let app: ReturnType<typeof createApp>;
let sessions: ReturnType<typeof createSessionMiddleware>;
let clientNumber = 0;
function agent() {
  const ip = '10.20.0.' + (++clientNumber);
  return request.agent(app).set('Origin', origin).set('X-Forwarded-For', ip);
}
type Agent = ReturnType<typeof agent>;
async function token(client: Agent) { return (await client.get('/api/v1/auth/csrf')).body.data.token as string; }
async function account(role = 'admin') {
  const email = randomUUID() + '@example.com';
  return AdminUser.create({ email, name: 'Test administrator', role });
}
async function start(client: Agent, email: string) {
  const csrf = await token(client);
  return client.post('/api/v1/auth/login').set('X-CSRF-Token', csrf).send({ email });
}
async function verify(client: Agent, challengeId: string, code: string) {
  const csrf = await token(client);
  return client.post('/api/v1/auth/verify').set('X-CSRF-Token', csrf).send({ challengeId, code });
}
async function login(role = 'admin') {
  const user = await account(role); const client = agent();
  const result = await start(client, user.email);
  expect(result.status).toBe(200);
  const result2 = await verify(client, result.body.data.challengeId, codes.get(user.email)!);
  expect(result2.status).toBe(200);
  return { user, client, result: result2 };
}
async function write(client: Agent, method: 'post' | 'put' | 'delete', path: string, body = {}) {
  const csrf = await token(client);
  return client[method](path).set('X-CSRF-Token', csrf).send(body);
}
const blog = { title: 'Real test article', slug: 'test-article', excerpt: 'An introduction', content: '<h2>Safe heading</h2><script>bad()</script>', category: 'Art', author: 'Teacher', status: 'draft' };
beforeAll(async () => {
  const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  await mongoose.connect(uri, { dbName: database, serverSelectionTimeoutMS: 5000 });
  await Promise.all([AdminUser.init(), OtpChallenge.init(), BlogPost.init()]);
  const env = { ...loadEnvForTest(), MONGODB_URI: uri, NODE_ENV: 'test' as const };
  sessions = createSessionMiddleware(env);
  app = createApp({ webOrigin: origin, sessionMiddleware: sessions, trustProxyHops: 1,
    auth: createAuthService({ secret: env.SESSION_SECRET, mailer: { async sendOtp(to, code) {
      if (failDelivery) throw new ApiError(503, 'MAIL_UNAVAILABLE', 'Delivery failed.');
      codes.set(to, code);
    } } }),
    mediaStorage: { async upload() { return { publicId: randomUUID(), url: 'https://example.com/' + randomUUID() + '.webp' }; } },
  });
}, 20000);
function loadEnvForTest() {
  return { ...loadEnvWithDefaults(), PORT: 4000, WEB_ORIGIN: origin, TRUST_PROXY_HOPS: 0 };
}
function loadEnvWithDefaults() {
  // Parse explicit test configuration; delivery uses only the injected test mailer.
  const previous = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: 'test', MONGODB_URI: 'mongodb://127.0.0.1:27017', WEB_ORIGIN: origin, SESSION_SECRET: 'test-only-secret-at-least-thirty-two-characters' });
    return loadEnv();
  } finally { for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key]; Object.assign(process.env, previous); }
}
afterAll(async () => {
  if (sessions) await sessions.closeStore();
  if (mongoose.connection.name === database) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
describe('email OTP and session security', () => {
  it('uses hashed codes, rotates sessions, rejects replay, and logs out', async () => {
    const user = await account(); const client = agent();
    const before = await client.get('/api/v1/auth/csrf');
    const cookieBefore = before.headers['set-cookie'][0].split(';')[0];
    const started = await start(client, user.email);
    const stored = await OtpChallenge.findOne({ challengeId: started.body.data.challengeId }).lean();
    expect(stored?.codeHash).not.toBe(codes.get(user.email));
    expect(JSON.stringify(started.body)).not.toContain(codes.get(user.email));
    const result = await verify(client, started.body.data.challengeId, codes.get(user.email)!);
    expect(result.status).toBe(200);
    expect(result.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    expect(result.headers['set-cookie'][0]).toMatch(/SameSite=Lax/);
    expect(result.headers['set-cookie'][0].split(';')[0]).not.toBe(cookieBefore);
    expect((await request(app).get('/api/v1/auth/session').set('Cookie', cookieBefore)).status).toBe(401);
    expect((await client.get('/api/v1/auth/session')).body.data.email).toBe(user.email);
    expect((await verify(client, started.body.data.challengeId, codes.get(user.email)!)).status).toBe(400);
    expect((await write(client, 'post', '/api/v1/auth/logout')).status).toBe(204);
    expect((await client.get('/api/v1/auth/session')).status).toBe(401);
  });
  it('requires matching origin and CSRF tokens for login and authenticated writes', async () => {
    const user = await account(); const client = agent();
    expect((await client.post('/api/v1/auth/login').send({ email: user.email })).status).toBe(403);
    expect((await client.post('/api/v1/auth/login').set('Origin', 'https://attacker.example').set('X-CSRF-Token', await token(client)).send({ email: user.email })).status).toBe(403);
    const signed = await login();
    expect((await signed.client.post('/api/v1/admin/blogs').send(blog)).status).toBe(403);
    expect((await signed.client.post('/api/v1/admin/blogs').set('X-CSRF-Token', 'é'.repeat(64)).send(blog)).status).toBe(403);
  });
  it('does not enroll unknown accounts or send codes to them', async () => {
    const client = agent(); const email = 'unknown@example.com';
    const response = await start(client, email);
    expect(response.status).toBe(200); expect(codes.has(email)).toBe(false);
    expect((await verify(client, response.body.data.challengeId, '123456')).status).toBe(400);
    expect(await AdminUser.exists({ email })).toBeNull();
  });
  it('expires codes and binds each challenge to the requesting browser', async () => {
    const user = await account(); const client = agent(); const response = await start(client, user.email);
    expect((await verify(agent(), response.body.data.challengeId, codes.get(user.email)!)).status).toBe(400);
    await OtpChallenge.updateOne({ challengeId: response.body.data.challengeId }, { expiresAt: new Date(0) });
    expect((await verify(client, response.body.data.challengeId, codes.get(user.email)!)).status).toBe(400);
  });
  it('locks a challenge after five incorrect attempts', async () => {
    const user = await account(); const client = agent(); const response = await start(client, user.email);
    const code = codes.get(user.email)!; const wrong = code === '111111' ? '222222' : '111111';
    for (let i = 0; i < 5; i++) expect((await verify(client, response.body.data.challengeId, wrong)).status).toBe(400);
    expect((await verify(client, response.body.data.challengeId, code)).status).toBe(400);
  });
  it('permits only one successful concurrent verification', async () => {
    const user = await account(); const client = agent(); const response = await start(client, user.email); const csrf = await token(client);
    const results = await Promise.all([1, 2].map(() => client.post('/api/v1/auth/verify').set('X-CSRF-Token', csrf).send({ challengeId: response.body.data.challengeId, code: codes.get(user.email)! })));
    expect(results.map(result => result.status).sort()).toEqual([200, 400]);
  });
  it('enforces resend cooldown and invalidates an old code on resend', async () => {
    const user = await account(); const client = agent(); const response = await start(client, user.email); const oldCode = codes.get(user.email)!;
    expect((await start(client, user.email)).status).toBe(429);
    await OtpChallenge.updateOne({ challengeId: response.body.data.challengeId }, { nextSendAt: new Date(0) });
    const next = await start(client, user.email); expect(next.status).toBe(200);
    expect((await verify(client, response.body.data.challengeId, oldCode)).status).toBe(400);
    expect((await verify(client, next.body.data.challengeId, codes.get(user.email)!)).status).toBe(200);
  });
  it('limits code sends per email even across different browsers and IPs', async () => {
    const user = await account(); const first = await start(agent(), user.email);
    await OtpChallenge.updateOne({ challengeId: first.body.data.challengeId }, { nextSendAt: new Date(0), sendCount: 6 });
    expect((await start(agent(), user.email)).status).toBe(429);
  });
  it('fails closed when delivery fails or mail is unconfigured', async () => {
    const user = await account(); const client = agent(); failDelivery = true;
    try { expect((await start(client, user.email)).status).toBe(503); } finally { failDelivery = false; }
    const stored = await OtpChallenge.findOne({ adminId: user._id }); expect(stored?.usedAt).toBeTruthy();
    const noMail = createApp({ webOrigin: origin, sessionMiddleware: sessions, auth: createAuthService({ secret: 'test-secret' }) });
    const other = request.agent(noMail).set('Origin', origin); const csrf = (await other.get('/api/v1/auth/csrf')).body.data.token;
    expect((await other.post('/api/v1/auth/login').set('X-CSRF-Token', csrf).send({ email: user.email })).status).toBe(503);
  });
  it('enforces IP rate limits', async () => {
    const client = agent();
    for (let i = 0; i < 10; i++) await start(client, 'limited' + i + '@example.com');
    expect((await start(client, 'limited-last@example.com')).status).toBe(429);
  });
  it('checks current role and disabled status on every request', async () => {
    const { user, client } = await login('editor');
    expect((await client.get('/api/v1/admin/blogs')).status).toBe(200);
    expect((await client.get('/api/v1/admin/settings')).status).toBe(403);
    await AdminUser.updateOne({ _id: user._id }, { status: 'disabled' });
    expect((await client.get('/api/v1/admin/dashboard')).status).toBe(401);
  });
  it('does not issue usable codes for disabled administrators', async () => {
    const user = await account(); await AdminUser.updateOne({ _id: user._id }, { status: 'disabled' });
    const client = agent(); expect((await start(client, user.email)).status).toBe(200);
    expect(codes.has(user.email)).toBe(false);
  });
  it('sets Secure cookies behind an explicitly trusted HTTPS proxy', async () => {
    const env = { ...loadEnvForTest(), MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', NODE_ENV: 'production' as const };
    const productionSessions = createSessionMiddleware(env);
    try {
      const production = createApp({ webOrigin: 'https://learn.artopusindia.com', sessionMiddleware: productionSessions, trustProxyHops: 1, secureCookies: true });
      const response = await request(production).get('/api/v1/auth/csrf').set('X-Forwarded-Proto', 'https');
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0]).toMatch(/; Secure/);
      expect(response.headers['set-cookie'][0]).toMatch(/; HttpOnly/);
    } finally { await productionSessions.closeStore(); }
  });
  it('rejects sessions after their absolute eight-hour lifetime', async () => {
    const { client, user } = await login();
    const collection = mongoose.connection.collection('admin_sessions');
    const stored = await collection.findOne({ session: { $regex: user._id.toHexString() } });
    expect(stored).toBeTruthy();
    const data = JSON.parse(stored!.session);
    data.authenticatedAt = Date.now() - 9 * 60 * 60 * 1000;
    await collection.updateOne({ _id: stored!._id }, { $set: { session: JSON.stringify(data) } });
    expect((await client.get('/api/v1/admin/dashboard')).status).toBe(401);
  });
  it('does not permit arbitrary CORS origins', async () => {
    const response = await request(app).get('/api/v1/auth/csrf').set('Origin', 'https://attacker.example');
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['cache-control']).toBe('no-store');
  });
});
describe('authenticated content management', () => {
  it('creates and sanitizes drafts, handles duplicate slugs, previews, publishes, and archives', async () => {
    const { client } = await login();
    const created = await write(client, 'post', '/api/v1/admin/blogs', blog);
    expect(created.status).toBe(201); expect(created.body.data.content).toBe('<h2>Safe heading</h2>');
    const id = created.body.data.id;
    expect((await request(app).get('/api/v1/blogs/test-article')).status).toBe(404);
    expect((await client.get('/api/v1/admin/blogs/' + id + '/preview')).status).toBe(200);
    expect((await write(client, 'post', '/api/v1/admin/blogs', blog)).status).toBe(409);
    expect((await write(client, 'put', '/api/v1/admin/blogs/' + id, { ...blog, status: 'published' })).status).toBe(200);
    expect((await request(app).get('/api/v1/blogs/test-article')).status).toBe(200);
    await write(client, 'delete', '/api/v1/admin/blogs/' + id);
    expect((await request(app).get('/api/v1/blogs/test-article')).status).toBe(404);
  });
  it('publishes scheduled articles when due and rejects past schedule input', async () => {
    const { client } = await login();
    expect((await write(client, 'post', '/api/v1/admin/blogs', { ...blog, slug: 'bad-schedule', status: 'scheduled', scheduledAt: new Date(0).toISOString() })).status).toBe(400);
    const scheduledAt = new Date(Date.now() + 86400000).toISOString();
    const created = await write(client, 'post', '/api/v1/admin/blogs', { ...blog, slug: 'scheduled-test', status: 'scheduled', scheduledAt });
    expect(created.status).toBe(201);
    expect((await request(app).get('/api/v1/blogs/scheduled-test')).status).toBe(404);
    await BlogPost.updateOne({ _id: created.body.data.id }, { scheduledAt: new Date(Date.now() - 1000) });
    await publishScheduledBlogs();
    expect((await request(app).get('/api/v1/blogs/scheduled-test')).status).toBe(200);
  });
  it('creates events, updates results and clears removed optional links', async () => {
    const { client } = await login();
    const event = { title: 'Workshop', slug: 'test-workshop', description: '<p>Draw</p>', eventType: 'workshop', locationType: 'online', location: '', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3600000).toISOString(), status: 'draft', registrationUrl: 'https://example.com/register' };
    const created = await write(client, 'post', '/api/v1/admin/events', event); expect(created.status).toBe(201);
    const withoutLink = { ...event, registrationUrl: undefined };
    const updated = await write(client, 'put', '/api/v1/admin/events/' + created.body.data.id, { ...withoutLink, status: 'published', results: '<p>Finished</p><script>bad()</script>' });
    expect(updated.status).toBe(200); expect(updated.body.data.registrationUrl).toBeUndefined(); expect(updated.body.data.results).toBe('<p>Finished</p>');
    expect((await request(app).get('/api/v1/events/test-workshop')).status).toBe(200);
  });
  it('creates, activates, reorders and deactivates classes', async () => {
    const { client } = await login();
    const offering = { title: 'Drawing', slug: 'test-drawing', description: '<p>Learn</p>', ageGroup: '8–12', classMode: 'online', status: 'active', displayOrder: 2 };
    const created = await write(client, 'post', '/api/v1/admin/classes', offering); expect(created.status).toBe(201);
    expect((await request(app).get('/api/v1/classes/test-drawing')).status).toBe(200);
    const changed = await write(client, 'put', '/api/v1/admin/classes/' + created.body.data.id, { ...offering, displayOrder: 0, status: 'inactive' });
    expect(changed.status).toBe(200); expect(changed.body.data.displayOrder).toBe(0);
    expect((await request(app).get('/api/v1/classes/test-drawing')).status).toBe(404);
  });
  it('provides database counts and actual recent content', async () => {
    const { client } = await login();
    await request(app).post('/api/v1/analytics/page-views').set('Origin', origin).send({ path: '/about' });
    const dashboard = await client.get('/api/v1/admin/dashboard');
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.counts.blogs).toBeGreaterThan(0); expect(dashboard.body.data.recent.length).toBeGreaterThan(0);
    expect(dashboard.body.data.pageViews).toEqual({ total: 1, pages: [{ path: '/about', views: 1 }] });
  });
  it('validates image decoding and protects referenced assets', async () => {
    const { client } = await login(); const csrf = await token(client);
    const unsafe = await client.post('/api/v1/admin/media').set('X-CSRF-Token', csrf).field('altText', 'Unsafe image').attach('image', Buffer.from('<svg>bad</svg>'), { filename: 'fake.png', contentType: 'image/png' });
    expect(unsafe.status).toBe(400);
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#7C3AED' } }).png().toBuffer();
    const uploaded = await client.post('/api/v1/admin/media').set('X-CSRF-Token', csrf).field('altText', 'Purple square').attach('image', image, { filename: 'square.png', contentType: 'image/png' });
    expect(uploaded.status).toBe(201); expect(uploaded.body.data.mimeType).toBe('image/webp');
    const id = uploaded.body.data.id;
    const edited = await client.patch('/api/v1/admin/media/' + id).set('X-CSRF-Token', await token(client)).send({ altText: 'Updated purple square' });
    expect(edited.status).toBe(200); expect(edited.body.data.altText).toBe('Updated purple square');
    expect((await MediaAsset.findById(id))?.altText).toBe('Updated purple square');
    const created = await write(client, 'post', '/api/v1/admin/blogs', { ...blog, slug: 'with-image', coverImage: id });
    expect(created.status).toBe(201);
    expect((await write(client, 'delete', '/api/v1/admin/media/' + id)).status).toBe(409);
    await write(client, 'put', '/api/v1/admin/blogs/' + created.body.data.id, { ...blog, slug: 'with-image' });
    expect((await write(client, 'delete', '/api/v1/admin/media/' + id)).status).toBe(204);
    expect((await write(client, 'post', '/api/v1/admin/blogs', { ...blog, slug: 'removed-image', coverImage: id })).status).toBe(400);
    expect((await MediaAsset.findById(id))?.url).toMatch(/^https:/);
  });
  it('validates and persists settings with sanitized text and safe CTA links', async () => {
    const { client } = await login();
    const settings = { branding: { name: 'Artopus', tagline: '' }, heroSection: { heading: 'Create', description: 'Explore' }, aboutSection: { heading: 'About', content: '<p>Learn</p><script>bad()</script>' }, featuredContent: { classes: [], events: [], gallery: [] }, registrationLinks: {}, socialLinks: {}, contactDetails: {}, seoDefaults: { title: 'Artopus', description: 'Art', siteUrl: 'https://learn.artopusindia.com' } };
    const saved = await write(client, 'put', '/api/v1/admin/settings', settings); expect(saved.status).toBe(200);
    expect(saved.body.data.aboutSection.content).toBe('<p>Learn</p>');
    const again = await write(client, 'put', '/api/v1/admin/settings', { ...settings, heroSection: { ...settings.heroSection, heading: 'Updated heading' } });
    expect(again.status).toBe(200);
    expect((await write(client, 'put', '/api/v1/admin/settings', { ...settings, heroSection: { ...settings.heroSection, primaryCta: { label: 'Bad', href: 'javascript:bad()' } } })).status).toBe(400);
    const featured = { ...settings, branding: { ...settings.branding, ownershipStatement: 'Operated by the confirmed business.' }, featuredVideo: { title: 'Our drawing classes', url: 'https://youtube.com/shorts/I-JhZjzQMLY' } };
    expect((await write(client, 'put', '/api/v1/admin/settings', featured)).status).toBe(200);
    const publicSettings = (await request(app).get('/api/v1/settings')).body.data;
    expect(publicSettings.branding.ownershipStatement).toBe('Operated by the confirmed business.');
    expect(publicSettings.featuredVideo.url).toBe(featured.featuredVideo.url);
    expect((await write(client, 'put', '/api/v1/admin/settings', { ...featured, featuredVideo: { title: 'Unsafe', url: 'https://attacker.example/embed/video' } })).status).toBe(400);
    expect((await write(client, 'put', '/api/v1/admin/settings', settings)).status).toBe(200);
    expect((await request(app).get('/api/v1/settings')).body.data.featuredVideo).toBeUndefined();
    expect((await request(app).get('/api/v1/settings')).body.data.branding.name).toBe('Artopus');
  });
});
