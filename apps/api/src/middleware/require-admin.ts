import type { RequestHandler } from 'express';
import type { AdminSession } from '@artopus/shared';
import { AdminUser } from '../modules/auth/admin-user.model.js';
import { ApiError } from '../lib/api-error.js';
import { SESSION_LIFETIME } from '../config/session.js';
declare module 'express-serve-static-core' { interface Locals { admin?: AdminSession } }
export const requireAdmin: RequestHandler = async (request, response, next) => {
  const { adminId, authenticatedAt } = request.session ?? {};
  if (!adminId || !authenticatedAt || Date.now() - authenticatedAt >= SESSION_LIFETIME) {
    next(new ApiError(401, 'UNAUTHENTICATED', 'Administrator authentication is required.')); return;
  }
  const user = await AdminUser.findOne({ _id: adminId, status: 'active', role: { $in: ['admin', 'editor'] } }).lean();
  if (!user) { next(new ApiError(401, 'UNAUTHENTICATED', 'This administrator session is no longer valid.')); return; }
  response.locals.admin = { id: user._id.toHexString(), name: user.name, email: user.email, role: user.role as 'admin' | 'editor' };
  next();
};
export const requireOwner: RequestHandler = (_request, response, next) => {
  if (response.locals.admin?.role !== 'admin') { next(new ApiError(403, 'FORBIDDEN', 'Only administrators can change site settings.')); return; }
  next();
};
