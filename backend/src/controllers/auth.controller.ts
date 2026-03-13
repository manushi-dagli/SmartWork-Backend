import type { Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import type { AuthRequest } from "../middleware/session.js";
import { sendSuccess } from "../common/response.js";
import { UnauthorizedError } from "../common/errors.js";

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  console.log("[API] GET /api/auth/session (Better Auth)");
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) throw new UnauthorizedError("Unauthorized");
  sendSuccess(res, session);
}
