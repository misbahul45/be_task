import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, { message: 'DATABASE_URL is required' })
    .refine(
      (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
      { message: 'DATABASE_URL must start with "postgresql://" or "postgres://"' }
    ),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, { message: 'ACCESS_TOKEN_SECRET should be at least 32 characters' }),

  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, { message: 'REFRESH_TOKEN_SECRET should be at least 32 characters' }),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  APP_VERSION: z.string().default('v1'),

  RESEND_API_KEY: z
    .string()
    .min(1, { message: 'RESEND_API_KEY is required' }),

  HF_API_KEY: z
    .string()
    .min(1, { message: 'HF_API_KEY is required' }),

  GROQ_API_KEY: z
    .string()
    .min(1, { message: 'GROQ_API_KEY is required' }),

  APP_URL: z
    .string()
    .url({ message: 'APP_URL must be valid application url' }),

  FE_URL: z
    .string()
    .url({ message: 'FE_URL must be valid application url' }),

  PORT: z
    .string()
    .regex(/^\d+$/, { message: 'PORT must be a number' })
    .transform((v) => parseInt(v, 10))
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  throw new Error('Environment validation failed');
}

export type Env = z.infer<typeof envSchema>;

const env: Env = parsed.data;

export default {
  databaseUrl: env.DATABASE_URL,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  nodeEnv: env.NODE_ENV,
  appVersion: env.APP_VERSION,
  RESEND_API_KEY: env.RESEND_API_KEY,
  APP_URL: env.APP_URL,
  FE_URL: env.FE_URL,
  PORT: env.PORT,
  HF_API_KEY: env.HF_API_KEY,
  GROQ_API_KEY: env.GROQ_API_KEY
};
