import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginSchema, verifyOtpSchema } from '@artopus/shared';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { requireCsrf } from '../../middleware/csrf.js';
export const authRouter = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many sign-in requests. Try again later.' } } });
const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many verification attempts. Try again later.' } } });
authRouter.use((_request, response, next) => { response.set('Cache-Control', 'no-store'); next(); });
authRouter.get('/csrf', authController.csrf);
authRouter.post('/login', loginLimiter, validateBody(loginSchema), requireCsrf, authController.login);
authRouter.post('/verify', verifyLimiter, validateBody(verifyOtpSchema), requireCsrf, authController.verify);
authRouter.get('/session', requireAdmin, authController.session);
authRouter.post('/logout', requireAdmin, requireCsrf, authController.logout);
