import { initializeSiteSettings } from './modules/settings/settings.service.js';
import { OtpChallenge } from './modules/auth/otp-challenge.model.js';
import { AdminUser } from './modules/auth/admin-user.model.js';
import { createMediaStorage } from './config/media-storage.js';
import { publishScheduledBlogs } from './modules/blogs/publish-scheduled.js';
import { createSessionMiddleware } from './config/session.js';
import { createOtpMailer } from './config/mail.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
async function start() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);
  await Promise.all([AdminUser.init(), OtpChallenge.init()]);
  await initializeSiteSettings();
  const sessions = createSessionMiddleware(env);
  await sessions.ready;
  await publishScheduledBlogs();
  const scheduler = setInterval(() => { void publishScheduledBlogs().catch(() => console.error('Scheduled publication failed; retrying in one minute.')); }, 60_000);
  scheduler.unref();
  const server = createApp({ webOrigin: env.WEB_ORIGIN, mediaStorage: createMediaStorage(env), sessionMiddleware: sessions, auth: createAuthService({ secret: env.SESSION_SECRET, mailer: createOtpMailer(env) }), secureCookies: env.NODE_ENV === 'production', trustProxyHops: env.TRUST_PROXY_HOPS }).listen(env.PORT, () => {
    console.info('Artopus API listening on port ' + env.PORT);
  });
  const shutdown = () => {
    clearInterval(scheduler);
    server.close(() => { void sessions.closeStore().then(() => disconnectDatabase()).then(() => process.exit(0)); });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
start().catch(() => {
  console.error('API startup failed. Check environment configuration and MongoDB availability.');
  process.exitCode = 1;
});
