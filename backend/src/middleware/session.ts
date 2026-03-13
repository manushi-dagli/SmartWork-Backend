import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { defineAbilityFor, type AppAbility } from "../lib/ability.js";
import type { Role } from "../lib/auth.js";

export type AuthRequest = Request & {
  session?: {
    user: { id: string; email: string; name: string; role: Role };
    session: { id: string };
  };
  ability?: AppAbility;
};

/** Asserts session exists; use after requireSession. */
export function getAuthRole(req: AuthRequest): Role {
  if (!req.session?.user?.role) throw new Error("Session or user role missing");
  return req.session.user.role;
}

export async function requireSession(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    req.session = session as unknown as AuthRequest["session"];
    const role = (session.user as { role?: Role }).role ?? "staff";
    req.ability = defineAbilityFor(role);
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
  }
}

export function requireAbility(action: string, subject: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.ability) {
      res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }
    if (!req.ability.can(action as "manage", subject as "all")) {
      res.status(403).json({ success: false, error: "Forbidden", code: "FORBIDDEN" });
      return;
    }
    next();
  };
}
