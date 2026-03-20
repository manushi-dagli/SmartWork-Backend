import { eq } from "drizzle-orm";
import { superAdmins } from "../db/schema.js";
import { db } from "../config/database.js";
import { logger } from "../lib/logger.js";

export interface SuperAdmin {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: typeof superAdmins.$inferSelect): SuperAdmin {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findSuperAdminById = async (id: string): Promise<SuperAdmin | null> => {
  logger.info(`Repository: Fetching super admin by id`);
  const rows = await db.select().from(superAdmins).where(eq(superAdmins.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

/** Find by username or email (for login and uniqueness checks). Returns row with passwordHash. */
export const findSuperAdminByUsernameOrEmail = async (
  usernameOrEmail: string
): Promise<(SuperAdmin & { passwordHash: string }) | null> => {
  logger.info(`Repository: Fetching super admin by username or email`);
  const rows = await db
    .select()
    .from(superAdmins)
    .where(eq(superAdmins.username, usernameOrEmail))
    .limit(1);
  let row = rows[0];
  if (!row) {
    const byEmail = await db.select().from(superAdmins).where(eq(superAdmins.email, usernameOrEmail)).limit(1);
    row = byEmail[0];
  }
  if (!row) return null;
  return { ...mapRow(row), passwordHash: row.passwordHash };
};

export const createSuperAdmin = async (dto: {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
}): Promise<SuperAdmin> => {
  logger.info(`Repository: Creating super admin`);
  const [row] = await db
    .insert(superAdmins)
    .values({
      username: dto.username,
      email: dto.email,
      passwordHash: dto.passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};
