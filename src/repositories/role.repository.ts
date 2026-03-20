import { eq, asc, ne } from "drizzle-orm";
import type { RoleValue } from "../common/types.js";
import type { Role, CreateRoleDto, UpdateRoleDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { roles } from "../db/schema.js";
import { db } from "../config/database.js";
import { logger } from "../lib/logger.js";

function mapRow(row: typeof roles.$inferSelect): Role {
  return {
    id: row.id,
    name: row.name,
    value: row.value,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findRoleById = async (id: string): Promise<Role | null> => {
  logger.info(`Repository: Fetching role by id`);
  const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

export const findRoleByValue = async (value: RoleValue): Promise<Role | null> => {
  logger.info(`Repository: Fetching role by value`);
  const rows = await db.select().from(roles).where(eq(roles.value, value)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

export const findManyRoles = async (): Promise<Role[]> => {
  logger.info(`Repository: Listing roles`);
  const rows = await db
    .select()
    .from(roles)
    .where(ne(roles.value, "SUPER_ADMIN"))
    .orderBy(asc(roles.name));
  return rows.map((r) => mapRow(r));
};

export const createRole = async (dto: CreateRoleDto): Promise<Role> => {
  logger.info(`Repository: Creating role`);
  const [row] = await db
    .insert(roles)
    .values({
      name: dto.name,
      value: dto.value,
      description: dto.description ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};

export const updateRole = async (id: string, dto: UpdateRoleDto): Promise<Role> => {
  logger.info(`Repository: Updating role`);
  const existing = await findRoleById(id);
  if (!existing) throw new NotFoundError("Role not found");

  const [row] = await db
    .update(roles)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.value !== undefined && { value: dto.value }),
      ...(dto.description !== undefined && { description: dto.description }),
      updatedAt: new Date(),
    })
    .where(eq(roles.id, id))
    .returning();
  if (!row) throw new Error("Update failed");
  return mapRow(row);
};

export const deleteRole = async (id: string): Promise<void> => {
  logger.info(`Repository: Deleting role`);
  const result = await db.delete(roles).where(eq(roles.id, id)).returning({ id: roles.id });
  if (result.length === 0) throw new NotFoundError("Role not found");
};
