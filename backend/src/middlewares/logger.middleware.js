import { env } from "../config/env.config.js";
import { logger } from "../utils/logger.utils.js";

export const requestLogger = (req, res, next) => {
	req.id = crypto.randomUUID();
	req.headers["x-request-id"] = req.id;
	res.set("x-request-id", req.id);

	res.on("finish", () => {
		const status = res.statusCode;
		logger.log({
			level: env.LOG_LEVEL,
			message: `[Request]: ${req.id} ${req.method} ${status} ${req.originalUrl}`,
			meta: {
				requestId: req.id,
				ip: req.ip,
				userAgent: req.headers["user-agent"],
			},
		});
	});
	next();
};
