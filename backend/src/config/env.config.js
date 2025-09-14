// use zod to validate env variables and export them, if not valid throw an error
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
	SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
	SUPABASE_SERVICE_ROLE_KEY: z
		.string()
		.min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
	// JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
	// JWT_EXPIRATION: z.string().default("1h"),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error("Invalid environment variables:", _env.error.format());
	throw new Error("Invalid environment variables");
}

export const env = _env.data;
