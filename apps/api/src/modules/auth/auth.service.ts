import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { AdminUser } from './admin-user.model.js';
import { OtpChallenge } from './otp-challenge.model.js';
import type { OtpMailer } from '../../config/mail.js';
import { ApiError } from '../../lib/api-error.js';
import { SESSION_LIFETIME } from '../../config/session.js';
import type { AdminSession, VerifyOtpInput } from '@artopus/shared';
const invalidCode = () => new ApiError(400, 'INVALID_OTP', 'This code is incorrect, expired, or already used. Request a new code if needed.');
export const saveSession = (request: Request) => new Promise<void>((resolve, reject) => request.session.save(error => error ? reject(error) : resolve()));
export function createAuthService(options: { secret: string; mailer?: OtpMailer }) {
  const digest = (purpose: string, value: string) => createHmac('sha256', options.secret).update(purpose + ':' + value).digest('hex');
  return {
    async requestOtp(request: Request, email: string) {
      if (!request.session) throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Administrator sign-in is not configured.');
      if (!options.mailer) throw new ApiError(503, 'MAIL_NOT_CONFIGURED', 'Sign-in email is not configured. Please contact the site owner.');
      const now = new Date();
      const emailHash = digest('email', email);
      const previous = await OtpChallenge.findOne({ emailHash }).lean();
      const activeWindow = previous && previous.windowEnd > now;
      if (previous && (previous.nextSendAt > now || (activeWindow && previous.sendCount >= 6))) {
        throw new ApiError(429, 'OTP_COOLDOWN', 'Please wait before requesting another code. At most six codes can be requested per hour.');
      }
      const user = await AdminUser.findOne({ email, status: 'active' }).select('_id').lean();
      const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const challengeId = randomBytes(32).toString('hex');
      const fields = {
        emailHash, challengeId, sessionHash: digest('session', request.sessionID),
        codeHash: digest('code', challengeId + ':' + code), adminId: user?._id ?? null,
        expiresAt: new Date(+now + 5 * 60_000), nextSendAt: new Date(+now + 60_000),
        windowEnd: activeWindow ? previous.windowEnd : new Date(+now + 60 * 60_000),
        sendCount: activeWindow ? previous.sendCount + 1 : 1,
        attempts: 0, usedAt: null, purgeAt: new Date(+now + 24 * 60 * 60_000),
      };
      try {
        const reserved = previous
          ? await OtpChallenge.findOneAndUpdate({ _id: previous._id, challengeId: previous.challengeId, nextSendAt: { $lte: now } }, { $set: fields }, { new: true })
          : await OtpChallenge.create(fields);
        if (!reserved) throw new ApiError(429, 'OTP_COOLDOWN', 'Please wait before requesting another code.');
      } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && error.code === 11000) throw new ApiError(429, 'OTP_COOLDOWN', 'Please wait before requesting another code.');
        throw error;
      }
      // Never send OTPs to unapproved accounts and never reveal account membership.
      if (user) {
        try { await options.mailer.sendOtp(email, code); }
        catch (error) { await OtpChallenge.updateOne({ challengeId }, { $set: { usedAt: new Date() } }); throw error; }
      }
      await saveSession(request);
      return { challengeId, expiresIn: 300, resendAfter: 60, message: 'If this email has administrator access, a sign-in code has been sent.' };
    },
    async verifyOtp(request: Request, input: VerifyOtpInput): Promise<AdminSession> {
      if (!request.session) throw invalidCode();
      const challenge = await OtpChallenge.findOneAndUpdate({
        challengeId: input.challengeId, sessionHash: digest('session', request.sessionID),
        expiresAt: { $gt: new Date() }, usedAt: null, attempts: { $lt: 5 },
      }, { $inc: { attempts: 1 } }, { new: true }).lean();
      if (!challenge) throw invalidCode();
      const expected = Buffer.from(challenge.codeHash, 'hex');
      const supplied = Buffer.from(digest('code', input.challengeId + ':' + input.code), 'hex');
      if (!timingSafeEqual(expected, supplied) || !challenge.adminId) throw invalidCode();
      const user = await AdminUser.findOne({ _id: challenge.adminId, status: 'active' }).lean();
      if (!user) throw invalidCode();
      const consumed = await OtpChallenge.findOneAndUpdate({
        _id: challenge._id, challengeId: input.challengeId, usedAt: null,
        expiresAt: { $gt: new Date() }, attempts: { $lte: 5 },
      }, { $set: { usedAt: new Date() } });
      if (!consumed) throw invalidCode();
      await new Promise<void>((resolve, reject) => request.session.regenerate(error => error ? reject(error) : resolve()));
      request.session.adminId = user._id.toHexString();
      request.session.authenticatedAt = Date.now();
      request.session.csrfToken = randomBytes(32).toString('hex');
      request.session.cookie.maxAge = SESSION_LIFETIME;
      await saveSession(request);
      return { id: user._id.toHexString(), name: user.name, email: user.email, role: user.role as 'admin' | 'editor' };
    },
  };
}
export type AuthService = ReturnType<typeof createAuthService>;
