import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/taskConfig.repository.js";
import { sendSuccess, sendCreated } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

const getId = (req: EmployeeAuthRequest): string =>
  typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

// Subtasks
export async function listSubtasks(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: List task config subtasks");
  const taskId = typeof req.query.taskId === "string" ? req.query.taskId : undefined;
  const list = taskId
    ? await repo.listSubtasksByTaskId(taskId)
    : await repo.listSubtasks();
  sendSuccess(res, list);
}

export async function getSubtask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Get task config subtask by id");
  const row = await repo.getSubtaskById(getId(req));
  if (!row) throw new NotFoundError("Subtask not found");
  sendSuccess(res, row);
}

export async function createSubtask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Create task config subtask");
  const created = await repo.createSubtask(req.body);
  sendCreated(res, created);
}

export async function updateSubtask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Update task config subtask");
  const updated = await repo.updateSubtask(getId(req), req.body);
  if (!updated) throw new NotFoundError("Subtask not found");
  sendSuccess(res, updated);
}

export async function deleteSubtask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Delete task config subtask");
  const deleted = await repo.deleteSubtask(getId(req));
  if (!deleted) throw new NotFoundError("Subtask not found");
  sendSuccess(res, { deleted: true });
}

// Tasks
export async function listTasks(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: List task config tasks");
  const list = await repo.listTasks();
  sendSuccess(res, list);
}

export async function getTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Get task config task by id");
  const row = await repo.getTaskById(getId(req));
  if (!row) throw new NotFoundError("Task not found");
  sendSuccess(res, row);
}

export async function createTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Create task config task");
  const created = await repo.createTask(req.body);
  sendCreated(res, created);
}

export async function updateTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Update task config task");
  const updated = await repo.updateTask(getId(req), req.body);
  if (!updated) throw new NotFoundError("Task not found");
  sendSuccess(res, updated);
}

export async function deleteTask(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Delete task config task");
  const deleted = await repo.deleteTask(getId(req));
  if (!deleted) throw new NotFoundError("Task not found");
  sendSuccess(res, { deleted: true });
}

// Documents (document master)
export async function listDocuments(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: List task config documents");
  const list = await repo.listDocuments();
  sendSuccess(res, list);
}

export async function getDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Get task config document by id");
  const row = await repo.getDocumentById(getId(req));
  if (!row) throw new NotFoundError("Document not found");
  sendSuccess(res, row);
}

export async function createDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Create task config document");
  const created = await repo.createDocument(req.body);
  sendCreated(res, created);
}

export async function updateDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Update task config document");
  const updated = await repo.updateDocument(getId(req), req.body);
  if (!updated) throw new NotFoundError("Document not found");
  sendSuccess(res, updated);
}

export async function deleteDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: Delete task config document");
  const deleted = await repo.deleteDocument(getId(req));
  if (!deleted) throw new NotFoundError("Document not found");
  sendSuccess(res, { deleted: true });
}
