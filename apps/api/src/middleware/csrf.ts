import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { ApiError } from '../lib/api-error.js';
export const requireCsrf: RequestHandler = (request, _response, next) => {
  const origin = request.get('origin');
  const token = request.get('x-csrf-token');
  const expected = request.session?.csrfToken;
  if (origin !== request.app.locals.webOrigin || !token || !expected || Buffer.byteLength(token) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    next(new ApiError(403, 'CSRF_INVALID', 'Your form session has expired. Reload and try again.')); return;
  }
  next();
};
