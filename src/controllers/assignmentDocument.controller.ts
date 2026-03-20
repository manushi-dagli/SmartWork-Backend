import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/assignmentDocument.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createAssignmentDocumentSchema,
  updateAssignmentDocumentSchema,
} from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
function idParam(req: EmployeeAuthRequest): string {
  return (req.params.id ?? req.params[0]) as string;
}

export async function listByAssignment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const assignmentId = (req.params.assignmentId ?? req.params[0]) as string;
  logger.info(`Controller: GET /api/assignments/:assignmentId/documents ${assignmentId}`);
  const list = await repo.listByAssignment(assignmentId);
  sendSuccess(res, list);
}

export async function getOne(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = idParam(req);
  const doc = await repo.getById(id);
  if (!doc) {
    sendError(res, new NotFoundError("Document not found"));
    return;
  }
  sendSuccess(res, doc);
}

export async function create(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const body = validateBody(req.body, createAssignmentDocumentSchema);
  const doc = await repo.create(body);
  sendCreated(res, doc);
}

export async function update(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = idParam(req);
  const body = validateBody(req.body, updateAssignmentDocumentSchema);
  const doc = await repo.update(id, body);
  sendSuccess(res, doc);
}

export async function deleteOne(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = idParam(req);
  await repo.deleteById(id);
  sendSuccess(res, { deleted: true });
}
