import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as allocatedTaskRepo from "../repositories/allocatedTask.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createAllocatedTaskSchema,
  updateAllocatedTaskSchema,
} from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
function allocatedTaskId(req: EmployeeAuthRequest): string {
  const id = req.params.id ?? req.params[0];
  return typeof id === "string" ? id : "";
}

export async function listByAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const assignmentId =
    typeof req.params.assignmentId === "string"
      ? req.params.assignmentId
      : req.params[0] ?? "";
  logger.info(`Controller: GET /api/assignments/:assignmentId/tasks ${assignmentId}`);
  const list = await allocatedTaskRepo.listAllocatedTasksByAssignment(
    assignmentId
  );
  sendSuccess(res, list);
}

export async function getAllocatedTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = allocatedTaskId(req);
  logger.info(`Controller: GET /api/allocated-tasks/:id ${id}`);
  const task = await allocatedTaskRepo.getAllocatedTaskById(id);
  if (!task) {
    sendError(res, new NotFoundError("Allocated task not found"));
    return;
  }
  sendSuccess(res, task);
}

export async function createAllocatedTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: POST /api/allocated-tasks");
  try {
    const body = validateBody(req.body, createAllocatedTaskSchema);
    const task = await allocatedTaskRepo.createAllocatedTask(body);
    sendCreated(res, task);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateAllocatedTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = allocatedTaskId(req);
  logger.info(`Controller: PATCH /api/allocated-tasks/:id ${id}`);
  try {
    const body = validateBody(req.body, updateAllocatedTaskSchema);
    const task = await allocatedTaskRepo.updateAllocatedTask(id, body);
    sendSuccess(res, task);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteAllocatedTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = allocatedTaskId(req);
  logger.info(`Controller: DELETE /api/allocated-tasks/:id ${id}`);
  try {
    await allocatedTaskRepo.deleteAllocatedTask(id);
    sendSuccess(res, { deleted: true });
  } catch (e) {
    sendError(res, e as Error);
  }
}
