import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().max(254).pipe(z.email()) });
export const verifyOtpSchema = z.object({ challengeId: z.string().regex(/^[a-f0-9]{64}$/), code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code') });
export const adminRoleSchema = z.enum(['admin', 'editor']);
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type AdminRole = z.infer<typeof adminRoleSchema>;
