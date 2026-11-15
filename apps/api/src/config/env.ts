import { z } from 'zod';
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  WEB_ORIGIN: z.url(),
  SESSION_SECRET: z.string().min(32).refine((value) => !value.startsWith('replace-'), 'Replace the example session secret'),
  RESEND_API_KEY: z.string().trim().optional(),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
}).superRefine((env, context) => {
  if (env.NODE_ENV === 'production' && !env.RESEND_API_KEY) {
    context.addIssue({ code: 'custom', path: ['RESEND_API_KEY'], message: 'RESEND_API_KEY is required in production' });
  }
});
export function loadEnv() { return envSchema.parse({ ...process.env, MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI }); }
export type AppEnv = z.infer<typeof envSchema>;
