import type { Request, Response, NextFunction } from "express";
import { sendError } from "../common/response.js";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps async route handlers so thrown errors are passed to sendError.
 * Controllers can throw AppError (or any error) instead of try/catch + sendError.
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err) => sendError(res, err));
  };
}
