import dotenv from 'dotenv';
import type { Environment } from '../types/env.js';

dotenv.config();

const ENV: Environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: process.env.REDIS_PORT!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  REDIS_USERNAME: process.env.REDIS_USERNAME!,
  DATABASE_URL: process.env.DATABASE_URL!,
};

const requiredKeys: (keyof Environment)[] = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  // 'REDIS_HOST',
  // 'REDIS_PORT',
  // 'REDIS_PASSWORD',
  // 'REDIS_USERNAME',
  'DATABASE_URL',
];

for (const key of requiredKeys) {
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default ENV;
