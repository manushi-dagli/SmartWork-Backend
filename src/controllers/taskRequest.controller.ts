import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as taskRequestRepo from "../repositories/taskRequest.repository.js";
import * as taskConfigRepo from "../repositories/taskConfig.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createTaskRequestSchema,
  updateTaskRequestSchema,
  setTaskRequestDocumentsSchema,
  uploadTaskRequestAttachmentSchema,
} from "../validations/schemas.js";
import * as taskRequestAttachmentRepo from "../repositories/taskRequestAttachment.repository.js";

import { logger } from "../lib/logger.js";
function taskRequestId(req: EmployeeAuthRequest): string {
  const id = req.params.id ?? req.params[0];
  return typeof id === "string" ? id : "";
}

export async function listTaskRequests(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/task-requests");
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const allowed = ["PENDING", "ACCEPTED", "REJECTED"];
  const filters =
    status && allowed.includes(status)
      ? { status: status as taskRequestRepo.TaskRequestStatus }
      : undefined;
  const list = await taskRequestRepo.listTaskRequests(filters);
  sendSuccess(res, list);
}

export async function getTaskRequest(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: GET /api/task-requests/:id ${id}`);
  const taskRequest = await taskRequestRepo.getTaskRequestWithDocuments(id);
  if (!taskRequest) {
    sendError(res, new NotFoundError("Task request not found"));
    return;
  }
  sendSuccess(res, taskRequest);
}

export async function createTaskRequest(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/task-requests");
  try {
    const body = validateBody(req.body, createTaskRequestSchema);
    const taskRequest = await taskRequestRepo.createTaskRequest(body);
    sendCreated(res, taskRequest);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateTaskRequest(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: PATCH /api/task-requests/:id ${id}`);
  try {
    const body = validateBody(req.body, updateTaskRequestSchema);
    const taskRequest = await taskRequestRepo.updateTaskRequest(id, body);
    if (!taskRequest) {
      sendError(res, new NotFoundError("Task request not found"));
      return;
    }
    sendSuccess(res, taskRequest);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function setTaskRequestDocuments(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: POST /api/task-requests/:id/documents ${id}`);
  try {
    const { documentMasterIds: ids } = validateBody(req.body, setTaskRequestDocumentsSchema);
    const existing = await taskRequestRepo.getTaskRequestById(id);
    if (!existing) {
      sendError(res, new NotFoundError("Task request not found"));
      return;
    }
    await taskRequestRepo.setTaskRequestDocuments(id, ids);
    const taskRequest = await taskRequestRepo.getTaskRequestWithDocuments(id);
    sendSuccess(res, taskRequest ?? existing);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function getTaskRequestDocuments(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: GET /api/task-requests/:id/documents ${id}`);
  const existing = await taskRequestRepo.getTaskRequestById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Task request not found"));
    return;
  }
  const docs = await taskRequestRepo.getDocumentsForTaskRequest(id);
  sendSuccess(res, docs);
}

export async function markTaskRequestSent(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: POST /api/task-requests/:id/send ${id}`);
  const body = (req.body as { emailed?: boolean; whatsapp?: boolean }) ?? {};
  const existing = await taskRequestRepo.getTaskRequestById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Task request not found"));
    return;
  }
  const dto: taskRequestRepo.UpdateTaskRequestDto = {};
  if (body.emailed) dto.emailedAt = new Date();
  if (body.whatsapp) dto.whatsappSentAt = new Date();
  const taskRequest = await taskRequestRepo.updateTaskRequest(id, dto);
  sendSuccess(res, taskRequest ?? existing);
}

export async function acceptTaskRequest(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: POST /api/task-requests/:id/accept ${id}`);
  try {
    const taskRequest = await taskRequestRepo.acceptTaskRequest(id);
    sendSuccess(res, taskRequest);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function rejectTaskRequest(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: POST /api/task-requests/:id/reject ${id}`);
  try {
    const taskRequest = await taskRequestRepo.rejectTaskRequest(id);
    sendSuccess(res, taskRequest);
  } catch (e) {
    sendError(res, e as Error);
  }
}

// Staff read-only config (no requireSuperAdmin)
export async function listTasksForStaff(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/task-requests/task-types");
  const list = await taskConfigRepo.listTasks();
  sendSuccess(res, list);
}

export async function listSubtasksWithTaskForStaff(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: GET /api/task-requests/subtasks-with-task");
  const list = await taskConfigRepo.listSubtasksWithTask();
  sendSuccess(res, list);
}

export async function listDocumentsForStaff(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: GET /api/task-requests/documents");
  const list = await taskConfigRepo.listDocuments();
  sendSuccess(res, list);
}

function attachmentIdParam(req: EmployeeAuthRequest): string {
  const attId = req.params.attId ?? req.params[0];
  return typeof attId === "string" ? attId : "";
}

export async function uploadTaskRequestAttachment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = taskRequestId(req);
  logger.info(`Controller: POST /api/task-requests/:id/attachments ${id}`);
  try {
    const existing = await taskRequestRepo.getTaskRequestById(id);
    if (!existing) {
      sendError(res, new NotFoundError("Task request not found"));
      return;
    }
    const body = validateBody(req.body, uploadTaskRequestAttachmentSchema);
    const content = Buffer.from(body.content, "base64");
    const attachment = await taskRequestAttachmentRepo.createAttachment({
      taskRequestId: id,
      fileName: body.fileName,
      mimeType: body.mimeType,
      content,
    });
    sendCreated(res, {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      createdAt: attachment.createdAt,
    });
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function getTaskRequestAttachmentFile(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = taskRequestId(req);
  const attId = attachmentIdParam(req);
  logger.info(`Controller: GET /api/task-requests/:id/attachments/:attId/file ${id} ${attId}`);
  const existing = await taskRequestRepo.getTaskRequestById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Task request not found"));
    return;
  }
  const attachment = await taskRequestAttachmentRepo.getAttachmentById(attId, id);
  if (!attachment) {
    sendError(res, new NotFoundError("Attachment not found"));
    return;
  }
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${attachment.fileName.replace(/"/g, '\\"')}"`
  );
  res.send(attachment.content);
}

export async function deleteTaskRequestAttachment(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const id = taskRequestId(req);
  const attId = attachmentIdParam(req);
  logger.info(`Controller: DELETE /api/task-requests/:id/attachments/:attId ${id} ${attId}`);
  const existing = await taskRequestRepo.getTaskRequestById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Task request not found"));
    return;
  }
  const deleted = await taskRequestAttachmentRepo.deleteAttachment(attId, id);
  if (!deleted) {
    sendError(res, new NotFoundError("Attachment not found"));
    return;
  }
  res.status(204).end();
}

