export interface Environment {
  NODE_ENV: string;
  PORT: number;
  LOG_LEVEL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD: string;
  REDIS_USERNAME: string;
  DATABASE_URL: string;
}
