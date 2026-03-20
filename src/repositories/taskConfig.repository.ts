import { eq, asc } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  tasks,
  subtasks,
  documentMaster,
} from "../db/schema.js";

export interface SubtaskWithTask {
  id: string;
  name: string;
  taskId: string;
  taskName: string;
}
import type {
  TaskRow,
  TaskInsert,
  SubtaskRow,
  SubtaskInsert,
  DocumentMasterInsert,
  DocumentMasterRow,
} from "../db/schema.js";
import { logger } from "../lib/logger.js";

export type Task = TaskRow;
export type Subtask = SubtaskRow;
export type DocumentMaster = DocumentMasterRow;

export async function listTasks(): Promise<Task[]> {
  logger.info(`Repository: Listing tasks`);
  return db.select().from(tasks).orderBy(asc(tasks.name));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  logger.info(`Repository: Fetching task by id`);
  const rows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return rows[0];
}

export async function createTask(
  dto: Pick<TaskInsert, "name" | "description">
): Promise<Task> {
  logger.info(`Repository: Creating task`);
  const [row] = await db.insert(tasks).values(dto).returning();
  return row!;
}

export async function updateTask(
  id: string,
  dto: Partial<Pick<TaskInsert, "name" | "description">>
): Promise<Task | undefined> {
  logger.info(`Repository: Updating task`);
  const [row] = await db
    .update(tasks)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return row;
}

export async function deleteTask(id: string): Promise<boolean> {
  logger.info(`Repository: Deleting task`);
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return result.length > 0;
}

export async function listSubtasksByTaskId(taskId: string): Promise<Subtask[]> {
  logger.info(`Repository: Listing subtasks by task id`);
  return db
    .select()
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId))
    .orderBy(asc(subtasks.name));
}

export async function listSubtasks(): Promise<Subtask[]> {
  logger.info(`Repository: Listing subtasks`);
  return db.select().from(subtasks).orderBy(asc(subtasks.name));
}

/** List all subtasks with their task id and task name (for dropdowns). */
export async function listSubtasksWithTask(): Promise<SubtaskWithTask[]> {
  logger.info(`Repository: Listing subtasks with task`);
  const rows = await db
    .select({
      id: subtasks.id,
      name: subtasks.name,
      taskId: subtasks.taskId,
      taskName: tasks.name,
    })
    .from(subtasks)
    .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
    .orderBy(asc(tasks.name), asc(subtasks.name));
  return rows;
}

export async function getSubtaskById(id: string): Promise<Subtask | undefined> {
  logger.info(`Repository: Fetching subtask by id`);
  const rows = await db.select().from(subtasks).where(eq(subtasks.id, id)).limit(1);
  return rows[0];
}

export async function createSubtask(
  dto: Pick<SubtaskInsert, "taskId" | "name" | "description">
): Promise<Subtask> {
  logger.info(`Repository: Creating subtask`);
  const [row] = await db.insert(subtasks).values(dto).returning();
  return row!;
}

export async function updateSubtask(
  id: string,
  dto: Partial<Pick<SubtaskInsert, "name" | "description">>
): Promise<Subtask | undefined> {
  logger.info(`Repository: Updating subtask`);
  const [row] = await db
    .update(subtasks)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(subtasks.id, id))
    .returning();
  return row;
}

export async function deleteSubtask(id: string): Promise<boolean> {
  logger.info(`Repository: Deleting subtask`);
  const result = await db.delete(subtasks).where(eq(subtasks.id, id)).returning({ id: subtasks.id });
  return result.length > 0;
}

export async function listDocuments(): Promise<DocumentMaster[]> {
  logger.info(`Repository: Listing documents`);
  return db.select().from(documentMaster).orderBy(asc(documentMaster.name));
}

export async function getDocumentById(id: string): Promise<DocumentMaster | undefined> {
  logger.info(`Repository: Fetching document by id`);
  const rows = await db.select().from(documentMaster).where(eq(documentMaster.id, id)).limit(1);
  return rows[0];
}

export async function createDocument(
  dto: Pick<DocumentMasterInsert, "name" | "description">
): Promise<DocumentMaster> {
  logger.info(`Repository: Creating document`);
  const [row] = await db.insert(documentMaster).values(dto).returning();
  return row!;
}

export async function updateDocument(
  id: string,
  dto: Partial<Pick<DocumentMasterInsert, "name" | "description">>
): Promise<DocumentMaster | undefined> {
  logger.info(`Repository: Updating document`);
  const [row] = await db
    .update(documentMaster)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(documentMaster.id, id))
    .returning();
  return row;
}

export async function deleteDocument(id: string): Promise<boolean> {
  logger.info(`Repository: Deleting document`);
  const result = await db
    .delete(documentMaster)
    .where(eq(documentMaster.id, id))
    .returning({ id: documentMaster.id });
  return result.length > 0;
}
