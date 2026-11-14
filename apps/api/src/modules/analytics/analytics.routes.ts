import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pageViewInputSchema } from '@artopus/shared';
import { analyticsController } from './analytics.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { ApiError } from '../../lib/api-error.js';
export const analyticsRouter = Router();
const viewLimiter = rateLimit({
  windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many page-view requests. Try again later.' } },
});
analyticsRouter.use((_request, response, next) => { response.set('Cache-Control', 'no-store'); next(); });
analyticsRouter.get('/page-views', analyticsController.total);
analyticsRouter.post('/page-views', (request, _response, next) => {
  if (request.get('origin') !== request.app.locals.webOrigin) {
    next(new ApiError(403, 'ORIGIN_INVALID', 'Page views must come from this website.')); return;
  }
  if (!request.is('application/json')) {
    next(new ApiError(415, 'JSON_REQUIRED', 'Page views require JSON.')); return;
  }
  next();
}, viewLimiter, validateBody(pageViewInputSchema), analyticsController.record);
