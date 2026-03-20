import { eq, asc } from "drizzle-orm";
import type { Family, CreateFamilyDto, UpdateFamilyDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { family } from "../db/schema.js";
import { db } from "../config/database.js";
import { logger } from "../lib/logger.js";

function mapRow(row: typeof family.$inferSelect): Family {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findFamilyById = async (id: string): Promise<Family | null> => {
  logger.info(`Repository: Fetching family by id`);
  const rows = await db.select().from(family).where(eq(family.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

export const findManyFamilies = async (): Promise<Family[]> => {
  logger.info(`Repository: Listing families`);
  const rows = await db.select().from(family).orderBy(asc(family.name));
  return rows.map((r) => mapRow(r));
};

export const createFamily = async (dto: CreateFamilyDto): Promise<Family> => {
  logger.info(`Repository: Creating family`);
  const [row] = await db.insert(family).values({ name: dto.name }).returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};

export const updateFamily = async (id: string, dto: UpdateFamilyDto): Promise<Family> => {
  logger.info(`Repository: Updating family`);
  const existing = await findFamilyById(id);
  if (!existing) throw new NotFoundError("Family not found");

  const [row] = await db
    .update(family)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      updatedAt: new Date(),
    })
    .where(eq(family.id, id))
    .returning();
  if (!row) throw new Error("Update failed");
  return mapRow(row);
};

export const deleteFamily = async (id: string): Promise<void> => {
  logger.info(`Repository: Deleting family`);
  const result = await db.delete(family).where(eq(family.id, id)).returning({ id: family.id });
  if (result.length === 0) throw new NotFoundError("Family not found");
};
