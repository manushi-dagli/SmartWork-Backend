import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as assignmentRepo from "../repositories/assignment.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
function assignmentId(req: EmployeeAuthRequest): string {
  const id = req.params.id ?? req.params[0];
  return typeof id === "string" ? id : "";
}

export async function listAssignments(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: GET /api/assignments");
  const clientId =
    typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const allowedStatus = ["IN_PROGRESS", "COMPLETED"];
  const filters: assignmentRepo.AssignmentListFilters = {};
  if (clientId) filters.clientId = clientId;
  if (status && allowedStatus.includes(status))
    filters.status = status as assignmentRepo.AssignmentStatus;
  const list = await assignmentRepo.listAssignments(filters);
  sendSuccess(res, list);
}

export async function getAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = assignmentId(req);
  logger.info(`Controller: GET /api/assignments/:id ${id}`);
  const withDetails = req.query.details === "true";
  if (withDetails) {
    const result = await assignmentRepo.getAssignmentWithDetails(id);
    if (!result) {
      sendError(res, new NotFoundError("Assignment not found"));
      return;
    }
    sendSuccess(res, result);
    return;
  }
  const assignment = await assignmentRepo.getAssignmentById(id);
  if (!assignment) {
    sendError(res, new NotFoundError("Assignment not found"));
    return;
  }
  sendSuccess(res, assignment);
}

export async function createAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: POST /api/assignments");
  try {
    const body = validateBody(req.body, createAssignmentSchema);
    const assignment = await assignmentRepo.createAssignment(body);
    sendCreated(res, assignment);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = assignmentId(req);
  logger.info(`Controller: PATCH /api/assignments/:id ${id}`);
  try {
    const body = validateBody(req.body, updateAssignmentSchema);
    const assignment = await assignmentRepo.updateAssignment(id, body);
    sendSuccess(res, assignment);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = assignmentId(req);
  logger.info(`Controller: DELETE /api/assignments/:id ${id}`);
  try {
    await assignmentRepo.deleteAssignment(id);
    sendSuccess(res, { deleted: true });
  } catch (e) {
    sendError(res, e as Error);
  }
}
