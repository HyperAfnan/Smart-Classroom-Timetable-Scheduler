import express, { Application } from "express";
import ENV from "#config/env.js";
import { logger } from "#utils/logger/index.js";
import { requestLogger } from "#middlewares/requestLogger.js";
import { defaultRateLimiter } from "#middlewares/rateLimiter.js";
import indexRoutes from "#routes/index.js";
import connectRedis from "#config/redis.js";
import connectDatabase from "#config/database.js";

const app: Application = express();
const PORT: number = ENV.PORT || 3000;

app.use(express.json());
app.use(requestLogger);
app.use(defaultRateLimiter);

app.use("/", indexRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  connectRedis();
  connectDatabase();
});
