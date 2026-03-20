import type { Request } from "express";

/** Same behavior as distinct-backend `getClientIp` (packages/backend-service/src/utils/helper.ts). */
export function getClientIp(req: Request): string {
  const cloudFrontIp = req.headers["cloudfront-viewer-address"] as string | undefined;
  if (cloudFrontIp) return cloudFrontIp;

  const xForwardedFor = req.headers["x-forwarded-for"] as string | undefined;
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1] ?? "";
  }

  return req.socket?.remoteAddress ?? "";
}
