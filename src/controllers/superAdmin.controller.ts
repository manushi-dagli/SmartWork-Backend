import type { Request, Response } from "express";
import * as superAdminService from "../services/superAdmin.service.js";
import { sendCreated, sendError } from "../common/response.js";
import { env } from "../config/env.js";
import { validateBody } from "../validations/validate.js";
import { createSuperAdminSchema } from "../validations/schemas.js";

/** POST /super-admin — create super admin. Secured by X-API-Key header. */
export const createSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  console.log("[API] POST /api/super-admin");
  const apiKey = req.headers["x-api-key"] ?? req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  if (!env.superAdminSecretKey || apiKey !== env.superAdminSecretKey) {
    res.status(403).json({ success: false, error: "Forbidden", code: "INVALID_API_KEY" });
    return;
  }
  try {
    const body = validateBody(req.body, createSuperAdminSchema);
    const superAdmin = await superAdminService.createSuperAdmin({
      username: body.username,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName ?? null,
    });
    sendCreated(res, superAdmin);
  } catch (e) {
    sendError(res, e as Error);
  }
};
