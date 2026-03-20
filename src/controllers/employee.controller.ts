import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as employeeService from "../services/employee.service.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import type { ListQuery } from "../common/types.js";
import { validateBody } from "../validations/validate.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
export async function checkUsername(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/employees/check-username");
  const username = typeof req.query.username === "string" ? req.query.username : "";
  const excludeId = typeof req.query.excludeId === "string" ? req.query.excludeId : undefined;
  const result = await employeeService.checkUsernameAvailable(username, excludeId);
  sendSuccess(res, result);
}

export async function listEmployees(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/employees");
  const query: ListQuery = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
    roleId: typeof req.query.roleId === "string" ? req.query.roleId : undefined,
  };
  const result = await employeeService.listEmployees(query);
  sendSuccess(res, result);
}

export async function getEmployee(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/employees/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const employee = await employeeService.getEmployeeById(id, req.ability!);
  sendSuccess(res, employee);
}

export async function createEmployee(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/employees");
  try {
    const body = validateBody(req.body, createEmployeeSchema);
    const employee = await employeeService.createEmployee(body, req.ability!);
    sendCreated(res, employee);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateEmployee(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: PATCH /api/employees/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const body = validateBody(req.body, updateEmployeeSchema);
    const employee = await employeeService.updateEmployee(id, body, req.ability!);
    sendSuccess(res, employee);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteEmployee(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: DELETE /api/employees/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  await employeeService.deleteEmployee(id, req.ability!);
  sendSuccess(res, { deleted: true });
}
