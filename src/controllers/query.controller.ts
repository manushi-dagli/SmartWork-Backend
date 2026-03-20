import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/query.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import { createQuerySchema, updateQuerySchema } from "../validations/schemas.js";
import { logger } from "../lib/logger.js";

function idParam(req: EmployeeAuthRequest): string {
  return (req.params.id ?? req.params[0]) as string;
}

export async function listByAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: List queries by assignment");
  const assignmentId = (req.params.assignmentId ?? req.params[0]) as string;
  const list = await repo.listByAssignment(assignmentId);
  sendSuccess(res, list);
}

export async function getOne(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Get query by id");
  const id = idParam(req);
  const q = await repo.getById(id);
  if (!q) {
    sendError(res, new NotFoundError("Query not found"));
    return;
  }
  sendSuccess(res, q);
}

export async function create(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Create query");
  const body = validateBody(req.body, createQuerySchema);
  const q = await repo.create(body);
  sendCreated(res, q);
}

export async function update(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Update query");
  const id = idParam(req);
  const body = validateBody(req.body, updateQuerySchema);
  const q = await repo.update(id, body);
  sendSuccess(res, q);
}

export async function deleteOne(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Delete query");
  const id = idParam(req);
  await repo.deleteById(id);
  sendSuccess(res, { deleted: true });
}
