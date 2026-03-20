import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";
import { getClientIp } from "../lib/getClientIp.js";

/** Same idea as distinct-backend `requestIdMiddleware` (request.middleware.ts). */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ipAddress = getClientIp(req);
  const requestId = randomUUID();
  req.requestId = requestId;
  req.logger = logger.child({
    requestId,
    ipAddress,
  });
  next();
}
