import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as employeeRepo from "../repositories/employee.repository.js";
import * as permissionRepo from "../repositories/permission.repository.js";
import * as superAdminRepo from "../repositories/superAdmin.repository.js";
import { defineAbilityFromRolePermissions, type AppAbility, type PermissionLike } from "../lib/ability.js";
import { env } from "../config/env.js";
import type { RoleValue } from "../common/types.js";

const SUPER_ADMIN_ABILITY = defineAbilityFromRolePermissions(
  "",
  [{ action: "manage", subject: "all", scope: null }],
  []
);

/** Fallback permissions when DB has none for ADMIN/MANAGER (e.g. seed not run). Keeps API from returning 403. */
const ADMIN_FALLBACK_PERMISSIONS: PermissionLike[] = [
  { action: "manage", subject: "Firm", scope: null },
  { action: "manage", subject: "Client", scope: null },
  { action: "manage", subject: "Family", scope: null },
  { action: "read", subject: "User", scope: null },
  { action: "read", subject: "Report", scope: null },
  { action: "read", subject: "Settings", scope: null },
  { action: "read", subject: "Employee", scope: "same_or_below" },
  { action: "create", subject: "Employee", scope: "below" },
  { action: "update", subject: "Employee", scope: "below" },
  { action: "delete", subject: "Employee", scope: "below" },
  { action: "read", subject: "Role", scope: "same_or_below" },
  { action: "read", subject: "Role", scope: null },
  { action: "create", subject: "Role", scope: null },
  { action: "update", subject: "Role", scope: "below" },
  { action: "delete", subject: "Role", scope: "below" },
];

const MANAGER_FALLBACK_PERMISSIONS: PermissionLike[] = [
  { action: "manage", subject: "Firm", scope: null },
  { action: "manage", subject: "Client", scope: null },
  { action: "manage", subject: "Family", scope: null },
  { action: "read", subject: "User", scope: null },
  { action: "read", subject: "Report", scope: null },
  { action: "read", subject: "Settings", scope: null },
  { action: "read", subject: "Employee", scope: "same_or_below" },
  { action: "create", subject: "Employee", scope: "below" },
  { action: "update", subject: "Employee", scope: "below" },
  { action: "delete", subject: "Employee", scope: "below" },
  { action: "read", subject: "Role", scope: "same_or_below" },
  { action: "read", subject: "Role", scope: null },
  { action: "create", subject: "Role", scope: null },
  { action: "update", subject: "Role", scope: "below" },
  { action: "delete", subject: "Role", scope: "below" },
];

export type AuthMeta = {
  roleId: string | null;
  permissions: { action: string; subject: string; scope: string | null }[];
  descendantRoleIds: string[];
};

export type EmployeeAuthRequest = Request & {
  employee?: {
    id: string;
    username: string | null;
    email: string | null;
    firstName: string;
    lastName: string;
    roleValue: RoleValue;
    isSuperAdmin?: boolean;
  };
  ability?: AppAbility;
  authMeta?: AuthMeta;
};

function getToken(req: Request): string | null {
  const cookie = req.cookies?.employee_token;
  if (typeof cookie === "string") return cookie;
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export const requireEmployeeAuth = async (
  req: EmployeeAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      employeeId: string;
      roleValue?: RoleValue;
      isSuperAdmin?: boolean;
    };

    if (decoded.isSuperAdmin) {
      const superAdmin = await superAdminRepo.findSuperAdminById(decoded.employeeId);
      if (!superAdmin) {
        res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
        return;
      }
      req.employee = {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        roleValue: "SUPER_ADMIN",
        isSuperAdmin: true,
      };
      req.ability = SUPER_ADMIN_ABILITY;
      req.authMeta = {
        roleId: null,
        permissions: [{ action: "manage", subject: "all", scope: null }],
        descendantRoleIds: [],
      };
      next();
      return;
    }

    const result = await employeeRepo.findEmployeeWithRoleById(decoded.employeeId);
    if (!result) {
      res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }
    const { employee, role } = result;
    const roleValue = (decoded.roleValue ?? role?.value) as RoleValue ?? "EMPLOYEE";
    const roleId = role?.id ?? null;
    const permissions = roleId ? await permissionRepo.findPermissionsByRoleId(roleId) : [];
    const descendantRoleIds = roleId ? await permissionRepo.getDescendantRoleIds(roleId) : [];
    const permissionList =
      permissions.length > 0
        ? permissions.map((p) => ({ action: p.action, subject: p.subject, scope: p.scope }))
        : roleValue === "ADMIN"
          ? ADMIN_FALLBACK_PERMISSIONS
          : roleValue === "MANAGER"
            ? MANAGER_FALLBACK_PERMISSIONS
            : [];
    req.employee = {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      roleValue,
    };
    req.ability =
      roleId && permissionList.length > 0
        ? defineAbilityFromRolePermissions(roleId, permissionList, descendantRoleIds)
        : defineAbilityFromRolePermissions("", [], []);
    req.authMeta = {
      roleId,
      permissions: permissionList,
      descendantRoleIds,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
  }
};

/** Only super admins can proceed; others get 403. Use for inquiry config and other super-admin-only routes. */
export const requireSuperAdmin = (req: EmployeeAuthRequest, res: Response, next: NextFunction): void => {
  if (req.employee?.isSuperAdmin) {
    next();
    return;
  }
  res.status(403).json({ success: false, error: "Forbidden: Super Admin only", code: "FORBIDDEN" });
};

/** Only SUPER_ADMIN, ADMIN, and MANAGER can create inquiries; EMPLOYEE and ARTICLE get 403. Use on POST /inquiries only. */
export const requireCanCreateInquiry = (req: EmployeeAuthRequest, res: Response, next: NextFunction): void => {
  const roleValue = req.employee?.roleValue;
  if (roleValue === "SUPER_ADMIN" || roleValue === "ADMIN" || roleValue === "MANAGER") {
    next();
    return;
  }
  res.status(403).json({ success: false, error: "Forbidden: Only Super Admin, Admin, or Manager can create inquiries", code: "FORBIDDEN" });
};

export const requireAbility = (action: string, subject: string) => {
  return (req: EmployeeAuthRequest, res: Response, next: NextFunction): void => {
    if (req.employee?.isSuperAdmin) {
      next();
      return;
    }
    // Allow Admin and Manager to read Employee and Role even when permissions are empty (e.g. seed not run)
    const roleValue = req.employee?.roleValue;
    if (
      action === "read" &&
      (subject === "Employee" || subject === "Role") &&
      (roleValue === "ADMIN" || roleValue === "MANAGER")
    ) {
      next();
      return;
    }
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
};
