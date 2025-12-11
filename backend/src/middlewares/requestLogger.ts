import { Request, Response, NextFunction } from 'express';
import ENV from '../config/env.js';
import { logger } from '../utils/logger/index.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  req.id = crypto.randomUUID();
  req.headers['x-request-id'] = req.id;
  res.set('x-request-id', req.id);

  res.on('finish', () => {
    const status = res.statusCode;
    logger.log({
      level: ENV.LOG_LEVEL,
      message: `[Request]: ${req.id} ${req.method} ${status} ${req.originalUrl}`,
      meta: {
        requestId: req.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
  });
  next();
};
