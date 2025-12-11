import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ENV from "./env.js";
import { logger } from "../utils/logger/index.js";

export default async function setupDatabase() {
  const client = postgres(ENV.DATABASE_URL);
  const db = drizzle({ client });

  await db
    .execute(`SELECT 1`)
    .then(() => logger.info(`Drizzle Connected to ${ENV.DATABASE_URL} `))
    .catch((err) => logger.error("Drizzle connection failed:", err));
}
