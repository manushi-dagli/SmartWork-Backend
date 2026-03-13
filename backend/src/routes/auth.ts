import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { requireSession, type AuthRequest } from "../middleware/session.js";

export const authRouter = Router();

authRouter.get("/me", requireSession, async (req: AuthRequest, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});
