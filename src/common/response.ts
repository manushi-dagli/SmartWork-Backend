import type { Response } from "express";
import { AppError } from "./errors.js";
import { logger } from "../lib/logger.js";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ data, success: true });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

/** Same pattern as distinct-backend `centralErrorHandler`: log then respond. */
export function sendError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    logger.error(`Error: ${error.message}`, error);
    res.status(error.statusCode).json({
      success: false,
      ...error.toJSON(),
    });
    return;
  }
  const message = error instanceof Error ? error.message : "Internal server error";
  if (error instanceof Error) {
    logger.error(`Error: ${message}`, error);
  } else {
    logger.error(`Error: ${message}`, { detail: error });
  }
  res.status(500).json({
    success: false,
    error: message,
    code: "INTERNAL_ERROR",
  });
}
