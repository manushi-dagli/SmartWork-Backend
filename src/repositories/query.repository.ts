import { eq, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { queries } from "../db/schema.js";
import type { QueryRow } from "../db/schema.js";
import type { Query, CreateQueryDto, UpdateQueryDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

function mapRow(row: QueryRow): Query {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    raisedById: row.raisedById,
    queryDescription: row.queryDescription,
    assignedToId: row.assignedToId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listByAssignment(
  assignmentId: string
): Promise<Query[]> {
  logger.info(`Repository: Listing queries by assignment id`);
  const rows = await db
    .select()
    .from(queries)
    .where(eq(queries.assignmentId, assignmentId))
    .orderBy(desc(queries.createdAt));
  return rows.map(mapRow);
}

export async function getById(id: string): Promise<Query | null> {
  logger.info(`Repository: Fetching query by id`);
  const rows = await db
    .select()
    .from(queries)
    .where(eq(queries.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

export async function create(dto: CreateQueryDto): Promise<Query> {
  logger.info(`Repository: Creating query`);
  const [row] = await db
    .insert(queries)
    .values({
      assignmentId: dto.assignmentId,
      raisedById: dto.raisedById ?? null,
      queryDescription: dto.queryDescription ?? null,
      assignedToId: dto.assignedToId ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert query failed");
  return mapRow(row);
}

export async function update(id: string, dto: UpdateQueryDto): Promise<Query> {
  logger.info(`Repository: Updating query`);
  const existing = await getById(id);
  if (!existing) throw new NotFoundError("Query not found");
  const [row] = await db
    .update(queries)
    .set({
      ...(dto.queryDescription !== undefined && { queryDescription: dto.queryDescription }),
      ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
      ...(dto.status !== undefined && { status: dto.status }),
      updatedAt: new Date(),
    })
    .where(eq(queries.id, id))
    .returning();
  if (!row) throw new Error("Update query failed");
  return mapRow(row);
}

export async function deleteById(id: string): Promise<void> {
  logger.info(`Repository: Deleting query`);
  const deleted = await db
    .delete(queries)
    .where(eq(queries.id, id))
    .returning({ id: queries.id });
  if (deleted.length === 0) throw new NotFoundError("Query not found");
}
