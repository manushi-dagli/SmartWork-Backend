import { eq, desc, and } from "drizzle-orm";
import { db } from "../config/database.js";
import { allocatedTasks } from "../db/schema.js";
import type { AllocatedTaskRow } from "../db/schema.js";
import type {
  AllocatedTask,
  CreateAllocatedTaskDto,
  UpdateAllocatedTaskDto,
} from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

function mapRow(row: AllocatedTaskRow): AllocatedTask {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    description: row.description,
    assignedToId: row.assignedToId,
    assignedById: row.assignedById,
    startDate: row.startDate?.toISOString() ?? null,
    dueDate: row.dueDate?.toISOString() ?? null,
    priority: row.priority,
    checkingRequired: row.checkingRequired,
    checkerId: row.checkerId,
    reviewStatus: row.reviewStatus,
    checkedById: row.checkedById,
    checkedAt: row.checkedAt?.toISOString() ?? null,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAllocatedTasksByAssignment(
  assignmentId: string
): Promise<AllocatedTask[]> {
  logger.info(`Repository: Listing allocated tasks by assignment id`);
  const rows = await db
    .select()
    .from(allocatedTasks)
    .where(eq(allocatedTasks.assignmentId, assignmentId))
    .orderBy(desc(allocatedTasks.createdAt));
  return rows.map(mapRow);
}

export async function getAllocatedTaskById(
  id: string
): Promise<AllocatedTask | null> {
  logger.info(`Repository: Fetching allocated task by id`);
  const rows = await db
    .select()
    .from(allocatedTasks)
    .where(eq(allocatedTasks.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

export async function createAllocatedTask(
  dto: CreateAllocatedTaskDto
): Promise<AllocatedTask> {
  logger.info(`Repository: Creating allocated task`);
  const [row] = await db
    .insert(allocatedTasks)
    .values({
      assignmentId: dto.assignmentId,
      description: dto.description ?? null,
      assignedToId: dto.assignedToId ?? null,
      assignedById: dto.assignedById ?? null,
      startDate: dto.startDate != null ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate != null ? new Date(dto.dueDate) : null,
      priority: dto.priority ?? null,
      checkingRequired: dto.checkingRequired ?? false,
      checkerId: dto.checkerId ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert allocated task failed");
  return mapRow(row);
}

export async function updateAllocatedTask(
  id: string,
  dto: UpdateAllocatedTaskDto
): Promise<AllocatedTask> {
  logger.info(`Repository: Updating allocated task`);
  const existing = await getAllocatedTaskById(id);
  if (!existing) throw new NotFoundError("Allocated task not found");

  const [row] = await db
    .update(allocatedTasks)
    .set({
      ...(dto.assignmentId !== undefined && { assignmentId: dto.assignmentId }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
      ...(dto.assignedById !== undefined && { assignedById: dto.assignedById }),
      ...(dto.startDate !== undefined && {
        startDate: dto.startDate != null ? new Date(dto.startDate) : null,
      }),
      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate != null ? new Date(dto.dueDate) : null,
      }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.checkingRequired !== undefined && {
        checkingRequired: dto.checkingRequired,
      }),
      ...(dto.checkerId !== undefined && { checkerId: dto.checkerId }),
      ...(dto.reviewStatus !== undefined && { reviewStatus: dto.reviewStatus }),
      ...(dto.checkedById !== undefined && { checkedById: dto.checkedById }),
      ...(dto.checkedAt !== undefined && {
        checkedAt: dto.checkedAt != null ? new Date(dto.checkedAt) : null,
      }),
      ...(dto.remarks !== undefined && { remarks: dto.remarks }),
      updatedAt: new Date(),
    })
    .where(eq(allocatedTasks.id, id))
    .returning();
  if (!row) throw new Error("Update allocated task failed");
  return mapRow(row);
}

export async function deleteAllocatedTask(id: string): Promise<void> {
  logger.info(`Repository: Deleting allocated task`);
  const deleted = await db
    .delete(allocatedTasks)
    .where(eq(allocatedTasks.id, id))
    .returning({ id: allocatedTasks.id });
  if (deleted.length === 0) throw new NotFoundError("Allocated task not found");
}
