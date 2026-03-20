import type { Request, Response, NextFunction } from "express";
import { sendError } from "../common/response.js";
import { logger } from "../lib/logger.js";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps async route handlers so thrown errors are passed to sendError.
 * sendError logs with logger.error (same idea as distinct-backend asyncErrorHandler + centralErrorHandler).
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      if (res.headersSent) {
        logger.error(
          `Error: response already sent for ${req.method} ${req.originalUrl || req.url}`,
          err instanceof Error ? err : { err },
        );
        return;
      }
      sendError(res, err);
    });
  };
}
