import { randomBytes } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { loginSchema, verifyOtpSchema } from '@artopus/shared';
import { ApiError } from '../../lib/api-error.js';
import { saveSession, type AuthService } from './auth.service.js';
function service(request: Request): AuthService {
  const auth = request.app.locals.auth as AuthService | undefined;
  if (!auth) throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Administrator sign-in is not configured.');
  return auth;
}
export const authController = {
  login: (async (request, response) => {
    response.json({ data: await service(request).requestOtp(request, loginSchema.parse(request.body).email) });
  }) satisfies RequestHandler,
  verify: (async (request, response) => {
    response.json({ data: await service(request).verifyOtp(request, verifyOtpSchema.parse(request.body)) });
  }) satisfies RequestHandler,
  csrf: (async (request, response) => {
    if (!request.session) throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Administrator sign-in is not configured.');
    request.session.csrfToken ??= randomBytes(32).toString('hex');
    await saveSession(request);
    response.json({ data: { token: request.session.csrfToken } });
  }) satisfies RequestHandler,
  session: ((_request, response) => { response.json({ data: response.locals.admin }); }) satisfies RequestHandler,
  logout: (async (request, response) => {
    await new Promise<void>((resolve, reject) => request.session.destroy(error => error ? reject(error) : resolve()));
    response.clearCookie('artopus.sid', { httpOnly: true, sameSite: 'lax', secure: request.app.locals.secureCookies as boolean, path: '/' }).sendStatus(204);
  }) satisfies RequestHandler,
};
