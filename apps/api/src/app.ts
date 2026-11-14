import express, { type RequestHandler } from 'express';
import type { MediaStorage } from './config/media-storage.js';
import type { AuthService } from './modules/auth/auth.service.js';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { apiRouter } from './routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
export function createApp(options: { webOrigin: string; sessionMiddleware?: RequestHandler; auth?: AuthService; mediaStorage?: MediaStorage; secureCookies?: boolean; trustProxyHops?: number }) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.webOrigin = options.webOrigin;
  app.locals.auth = options.auth;
  app.locals.mediaStorage = options.mediaStorage;
  app.locals.secureCookies = options.secureCookies ?? false;
  if (options.trustProxyHops) app.set('trust proxy', options.trustProxyHops);
  app.use(helmet());
  app.use(cors({ origin: options.webOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_request, response) => { response.json({ data: { status: 'ok' } }); });
  app.get('/health/ready', (_request, response) => {
    const ready = mongoose.connection.readyState === 1;
    response.status(ready ? 200 : 503).json({ data: { status: ready ? 'ready' : 'not-ready' } });
  });
  if (options.sessionMiddleware) {
    app.use(['/api/v1/auth', '/api/v1/admin'], options.sessionMiddleware);
  }
  app.use('/api/v1', apiRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
