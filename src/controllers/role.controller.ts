import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as roleService from "../services/role.service.js";
import { sendSuccess, sendCreated } from "../common/response.js";
import type { CreateRoleDto, UpdateRoleDto } from "../common/types.js";

export async function listRoles(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] GET /api/roles");
  const roles = await roleService.listRoles();
  sendSuccess(res, roles);
}

export async function getRole(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] GET /api/roles/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const role = await roleService.getRoleById(id, req.ability!);
  sendSuccess(res, role);
}

export async function createRole(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] POST /api/roles");
  const role = await roleService.createRole(req.body as CreateRoleDto, req.ability!);
  sendCreated(res, role);
}

export async function updateRole(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] PATCH /api/roles/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const role = await roleService.updateRole(id, req.body as UpdateRoleDto, req.ability!);
  sendSuccess(res, role);
}

export async function deleteRole(req: EmployeeAuthRequest, res: Response): Promise<void> {
  console.log("[API] DELETE /api/roles/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  await roleService.deleteRole(id, req.ability!);
  sendSuccess(res, { deleted: true });
}
