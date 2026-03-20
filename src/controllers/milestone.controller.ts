import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as milestoneRepo from "../repositories/milestone.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
function milestoneId(req: EmployeeAuthRequest): string {
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
  logger.info(`Controller: GET /api/assignments/:assignmentId/milestones ${assignmentId}`);
  const list = await milestoneRepo.listMilestonesByAssignment(assignmentId);
  sendSuccess(res, list);
}

export async function getMilestone(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = milestoneId(req);
  logger.info(`Controller: GET /api/milestones/:id ${id}`);
  const milestone = await milestoneRepo.getMilestoneById(id);
  if (!milestone) {
    sendError(res, new NotFoundError("Milestone not found"));
    return;
  }
  sendSuccess(res, milestone);
}

export async function createMilestone(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: POST /api/milestones");
  try {
    const body = validateBody(req.body, createMilestoneSchema);
    const milestone = await milestoneRepo.createMilestone(body);
    sendCreated(res, milestone);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateMilestone(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = milestoneId(req);
  logger.info(`Controller: PATCH /api/milestones/:id ${id}`);
  try {
    const body = validateBody(req.body, updateMilestoneSchema);
    const milestone = await milestoneRepo.updateMilestone(id, body);
    sendSuccess(res, milestone);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteMilestone(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = milestoneId(req);
  logger.info(`Controller: DELETE /api/milestones/:id ${id}`);
  try {
    await milestoneRepo.deleteMilestone(id);
    sendSuccess(res, { deleted: true });
  } catch (e) {
    sendError(res, e as Error);
  }
}
