import ENV from "./env.js";
import { logger } from "../utils/logger/index.js";
import { Redis } from "ioredis";

const redisURI: string = `redis://${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`;

const connectRedis = () => {
  const client = new Redis(redisURI);

  client.on("connect", () =>
    logger.info(`Redis Client Connected to ${redisURI}`),
  );
  client.on("error", (e: Error) => logger.error(`Redis Client Error: ${e}`));

  return client;
};

export default connectRedis;
