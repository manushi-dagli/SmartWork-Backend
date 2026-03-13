import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as employeeRepo from "../repositories/employee.repository.js";
import * as superAdminRepo from "../repositories/superAdmin.repository.js";
import * as employeeService from "../services/employee.service.js";
import { sendSuccess, sendError } from "../common/response.js";
import { validateBody } from "../validations/validate.js";
import { updateProfileSchema } from "../validations/schemas.js";

/**
 * GET /api/profile — return full employee (or super admin) details for the logged-in user (JWT auth).
 */
export async function getProfile(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] GET /api/profile");
  const id = req.employee!.id;
  if (req.employee!.isSuperAdmin) {
    const superAdmin = await superAdminRepo.findSuperAdminById(id);
    if (!superAdmin) {
      res.status(404).json({ success: false, error: "User not found", code: "NOT_FOUND" });
      return;
    }
    sendSuccess(res, {
      kind: "super_admin",
      employee: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
      },
    });
    return;
  }
  const result = await employeeRepo.findEmployeeWithRoleById(id);
  if (!result) {
    res.status(404).json({ success: false, error: "Employee not found", code: "NOT_FOUND" });
    return;
  }
  const { employee, role } = result;
  sendSuccess(res, {
    kind: "employee",
    employee: {
      ...employee,
      roleName: role?.name ?? null,
      roleValue: role?.value ?? null,
    },
  });
}

/**
 * PATCH /api/profile — update the logged-in user's details (employees only).
 */
export async function updateProfile(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] PATCH /api/profile");
  if (req.employee!.isSuperAdmin) {
    res.status(400).json({
      success: false,
      error: "Super admin profile cannot be updated via this endpoint",
      code: "BAD_REQUEST",
    });
    return;
  }
  try {
    const body = validateBody(req.body, updateProfileSchema);
    await employeeService.updateEmployeeSelf(req.employee!.id, body);
  } catch (e) {
    sendError(res, e as Error);
    return;
  }
  const result = await employeeRepo.findEmployeeWithRoleById(req.employee!.id);
  if (!result) {
    res.status(404).json({ success: false, error: "Employee not found", code: "NOT_FOUND" });
    return;
  }
  const { employee, role } = result;
  sendSuccess(res, {
    ...employee,
    roleName: role?.name ?? null,
    roleValue: role?.value ?? null,
  });
}
