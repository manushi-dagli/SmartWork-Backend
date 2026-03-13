import type { Request, Response, NextFunction } from "express";

/** Log every request: method, path, status code, and duration when response finishes. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const method = req.method;
  const path = req.originalUrl || req.url;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[API] ${method} ${path} ${status} ${duration}ms`);
  });

  next();
}
