import { eq, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { assignmentDocuments } from "../db/schema.js";
import type { AssignmentDocumentRow } from "../db/schema.js";
import type {
  AssignmentDocument,
  CreateAssignmentDocumentDto,
  UpdateAssignmentDocumentDto,
} from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

function mapRow(row: AssignmentDocumentRow): AssignmentDocument {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    name: row.name,
    description: row.description,
    tag: row.tag,
    version: row.version,
    fileKey: row.fileKey,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listByAssignment(
  assignmentId: string
): Promise<AssignmentDocument[]> {
  logger.info(`Repository: Listing assignment documents by assignment id`);
  const rows = await db
    .select()
    .from(assignmentDocuments)
    .where(eq(assignmentDocuments.assignmentId, assignmentId))
    .orderBy(desc(assignmentDocuments.createdAt));
  return rows.map(mapRow);
}

export async function getById(id: string): Promise<AssignmentDocument | null> {
  logger.info(`Repository: Fetching assignment document by id`);
  const rows = await db
    .select()
    .from(assignmentDocuments)
    .where(eq(assignmentDocuments.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

export async function create(
  dto: CreateAssignmentDocumentDto
): Promise<AssignmentDocument> {
  logger.info(`Repository: Creating assignment document`);
  const [row] = await db
    .insert(assignmentDocuments)
    .values({
      assignmentId: dto.assignmentId,
      name: dto.name,
      description: dto.description ?? null,
      tag: dto.tag ?? null,
      version: dto.version ?? "1",
      fileKey: dto.fileKey ?? null,
      uploadedById: dto.uploadedById ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert assignment document failed");
  return mapRow(row);
}

export async function update(
  id: string,
  dto: UpdateAssignmentDocumentDto
): Promise<AssignmentDocument> {
  logger.info(`Repository: Updating assignment document`);
  const existing = await getById(id);
  if (!existing) throw new NotFoundError("Assignment document not found");
  const [row] = await db
    .update(assignmentDocuments)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.tag !== undefined && { tag: dto.tag }),
      ...(dto.version !== undefined && { version: dto.version }),
      ...(dto.fileKey !== undefined && { fileKey: dto.fileKey }),
      updatedAt: new Date(),
    })
    .where(eq(assignmentDocuments.id, id))
    .returning();
  if (!row) throw new Error("Update assignment document failed");
  return mapRow(row);
}

export async function deleteById(id: string): Promise<void> {
  logger.info(`Repository: Deleting assignment document`);
  const deleted = await db
    .delete(assignmentDocuments)
    .where(eq(assignmentDocuments.id, id))
    .returning({ id: assignmentDocuments.id });
  if (deleted.length === 0) throw new NotFoundError("Assignment document not found");
}
