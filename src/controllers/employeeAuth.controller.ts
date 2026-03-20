import type { Request, Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as employeeRepo from "../repositories/employee.repository.js";
import * as roleRepo from "../repositories/role.repository.js";
import * as permissionRepo from "../repositories/permission.repository.js";
import * as superAdminRepo from "../repositories/superAdmin.repository.js";
import { env } from "../config/env.js";
import { sendSuccess } from "../common/response.js";

import { logger } from "../lib/logger.js";
const JWT_EXPIRES_IN = "7d";

/** POST /auth/login — login with username/email and password (employees or super admins). */
export const employeeLogin = async (req: Request, res: Response): Promise<void> => {
  logger.info("Controller: POST /api/auth/login");
  const body = req.body as { usernameOrEmail?: string; password?: string };
  if (!body.usernameOrEmail || !body.password) {
    res.status(400).json({
      success: false,
      error: "usernameOrEmail and password are required",
      code: "BAD_REQUEST",
    });
    return;
  }
  const key = body.usernameOrEmail.trim();

  // Super admins first (separate table, not visible in app)
  const superRow = await superAdminRepo.findSuperAdminByUsernameOrEmail(key);
  if (superRow) {
    const match = await bcrypt.compare(body.password, superRow.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, error: "Invalid credentials", code: "UNAUTHORIZED" });
      return;
    }
    const token = jwt.sign(
      { employeeId: superRow.id, roleValue: "SUPER_ADMIN", isSuperAdmin: true },
      env.jwtSecret,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.cookie("employee_token", token, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, {
      token,
      employee: {
        id: superRow.id,
        username: superRow.username,
        email: superRow.email,
        firstName: superRow.firstName,
        lastName: superRow.lastName,
        roleValue: "SUPER_ADMIN",
        isSuperAdmin: true,
        roleId: null,
        permissions: [{ action: "manage", subject: "all", scope: null }],
        descendantRoleIds: [],
      },
    });
    return;
  }

  const row = await employeeRepo.findEmployeeByUsernameOrEmail(key);
  if (!row || !row.passwordHash) {
    res.status(401).json({ success: false, error: "Invalid credentials", code: "UNAUTHORIZED" });
    return;
  }
  const match = await bcrypt.compare(body.password, row.passwordHash);
  if (!match) {
    res.status(401).json({ success: false, error: "Invalid credentials", code: "UNAUTHORIZED" });
    return;
  }
  const role = row.roleId ? await roleRepo.findRoleById(row.roleId) : null;
  const roleValue = role?.value ?? "EMPLOYEE";
  const roleId = role?.id ?? null;
  const permissions = roleId ? await permissionRepo.findPermissionsByRoleId(roleId) : [];
  const descendantRoleIds = roleId ? await permissionRepo.getDescendantRoleIds(roleId) : [];
  const token = jwt.sign(
    { employeeId: row.id, roleValue, isSuperAdmin: false },
    env.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
  res.cookie("employee_token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, {
    token,
    employee: {
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      roleValue,
      roleId,
      permissions: permissions.map((p) => ({ action: p.action, subject: p.subject, scope: p.scope })),
      descendantRoleIds,
    },
  });
};

/** POST /auth/employee-logout — clear employee cookie. */
export const employeeLogout = async (_req: Request, res: Response): Promise<void> => {
  logger.info("Controller: POST /api/auth/logout");
  res.clearCookie("employee_token");
  sendSuccess(res, { loggedOut: true });
};

/** GET /session — current employee + permissions (requires employee auth). */
export const getSession = async (req: EmployeeAuthRequest, res: Response): Promise<void> => {
  logger.info("Controller: GET /api/auth/session");
  sendSuccess(res, {
    ...req.employee,
    roleId: req.authMeta?.roleId ?? null,
    permissions: req.authMeta?.permissions ?? [],
    descendantRoleIds: req.authMeta?.descendantRoleIds ?? [],
  });
};
