import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import type { AppEnv } from './env.js';
declare module 'express-session' {
  interface SessionData { adminId?: string; authenticatedAt?: number; csrfToken?: string }
}
export const SESSION_LIFETIME = 8 * 60 * 60 * 1000;
export function createSessionMiddleware(env: AppEnv) {
  const store = MongoStore.create({ mongoUrl: env.MONGODB_URI, dbName: mongoose.connection.name, collectionName: 'admin_sessions', ttl: SESSION_LIFETIME / 1000, autoRemove: 'native' });
  store.on('error', () => console.error('Administrator session storage is unavailable.'));
  const ready = store.collectionP.then(() => undefined);
  void ready.catch(() => console.error('Administrator session storage initialization failed.'));
  return Object.assign(session({
    name: 'artopus.sid', secret: env.SESSION_SECRET, store,
    resave: false, saveUninitialized: false, rolling: false,
    cookie: { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: SESSION_LIFETIME, path: '/' },
  }), { ready, closeStore: async () => { await ready.catch(() => undefined); await store.close(); } });
}
