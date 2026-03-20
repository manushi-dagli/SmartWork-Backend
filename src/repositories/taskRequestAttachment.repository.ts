import { eq, and } from "drizzle-orm";
import { db } from "../config/database.js";
import { taskRequestAttachments } from "../db/schema.js";
import type { TaskRequestAttachmentRow } from "../db/schema.js";
import { logger } from "../lib/logger.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export function isAllowedMimeType(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export interface CreateAttachmentDto {
  taskRequestId: string;
  fileName: string;
  mimeType: string;
  content: Buffer;
}

export async function createAttachment(
  dto: CreateAttachmentDto
): Promise<TaskRequestAttachmentRow> {
  logger.info(`Repository: Creating task request attachment`);
  if (dto.content.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File size must not exceed 5MB");
  }
  if (!isAllowedMimeType(dto.mimeType)) {
    throw new Error(
      `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }
  const [row] = await db
    .insert(taskRequestAttachments)
    .values({
      taskRequestId: dto.taskRequestId,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      content: dto.content,
    })
    .returning();
  if (!row) throw new Error("Insert attachment failed");
  return row;
}

export async function getAttachmentById(
  attachmentId: string,
  taskRequestId: string
): Promise<(TaskRequestAttachmentRow & { content: Buffer }) | undefined> {
  logger.info(`Repository: Fetching task request attachment by id`);
  const rows = await db
    .select()
    .from(taskRequestAttachments)
    .where(
      and(
        eq(taskRequestAttachments.id, attachmentId),
        eq(taskRequestAttachments.taskRequestId, taskRequestId)
      )
    )
    .limit(1);
  return rows[0] as (TaskRequestAttachmentRow & { content: Buffer }) | undefined;
}

export async function deleteAttachment(
  attachmentId: string,
  taskRequestId: string
): Promise<boolean> {
  logger.info(`Repository: Deleting task request attachment`);
  const existing = await getAttachmentById(attachmentId, taskRequestId);
  if (!existing) return false;
  await db
    .delete(taskRequestAttachments)
    .where(
      and(
        eq(taskRequestAttachments.id, attachmentId),
        eq(taskRequestAttachments.taskRequestId, taskRequestId)
      )
    );
  return true;
}
