import { eq, asc, desc, count, or } from "drizzle-orm";
import type { Employee, EmployeeListItem, CreateEmployeeDto, UpdateEmployeeDto, ListQuery, PaginatedResult, Role } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { employees, roles } from "../db/schema.js";
import { db } from "../config/database.js";
import { logger } from "../lib/logger.js";

const sortColumnMap = {
  firstName: employees.firstName,
  lastName: employees.lastName,
  email: employees.email,
  joiningDate: employees.joiningDate,
  createdAt: employees.createdAt,
} as const;

function mapRow(row: typeof employees.$inferSelect): Employee {
  return {
    id: row.id,
    username: row.username,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    address: row.address,
    phoneCountryCode: row.phoneCountryCode,
    phoneNumber: row.phoneNumber,
    email: row.email,
    ref: row.ref,
    bankDetails: row.bankDetails,
    pan: row.pan,
    aadhaarDetails: row.aadhaarDetails,
    upiId: row.upiId,
    qrCode: row.qrCode,
    joiningDate: row.joiningDate?.toISOString() ?? null,
    leavingDate: row.leavingDate?.toISOString() ?? null,
    roleId: row.roleId,
    profilePicture: row.profilePicture,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findEmployeeById = async (id: string): Promise<Employee | null> => {
  logger.info(`Repository: Fetching employee by id`);
  const rows = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

/** For auth: fetch employee and role in one query to avoid two round-trips. */
export const findEmployeeWithRoleById = async (
  id: string
): Promise<{ employee: Employee; role: Role | null } | null> => {
  logger.info(`Repository: Fetching employee with role by id`);
  const rows = await db
    .select({
      employee: employees,
      roleId: roles.id,
      roleName: roles.name,
      roleValue: roles.value,
      roleDescription: roles.description,
      roleCreatedAt: roles.createdAt,
      roleUpdatedAt: roles.updatedAt,
    })
    .from(employees)
    .leftJoin(roles, eq(employees.roleId, roles.id))
    .where(eq(employees.id, id))
    .limit(1);
  const row = rows[0];
  if (!row || !row.employee || !row.employee.isActive) return null;
  const emp = mapRow(row.employee);
  const role: Role | null =
    row.roleId != null && row.roleName != null && row.roleValue != null
      ? {
          id: row.roleId,
          name: row.roleName,
          value: row.roleValue,
          description: row.roleDescription ?? null,
          createdAt: (row.roleCreatedAt as Date).toISOString(),
          updatedAt: (row.roleUpdatedAt as Date).toISOString(),
        }
      : null;
  return { employee: emp, role };
};

/** Find employee by username. If excludeId is set, only returns a row if id !== excludeId (for update uniqueness). */
export const findEmployeeByUsername = async (
  username: string,
  excludeId?: string
): Promise<Employee | null> => {
  logger.info(`Repository: Fetching employee by username`);
  if (!username.trim()) return null;
  const rows = await db.select().from(employees).where(eq(employees.username, username.trim())).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (excludeId && row.id === excludeId) return null;
  return mapRow(row);
};

/** Find by username or email; returns row with passwordHash for login. Use for auth only. */
export const findEmployeeByUsernameOrEmail = async (
  usernameOrEmail: string
): Promise<(typeof employees.$inferSelect) | null> => {
  logger.info(`Repository: Fetching employee by username or email`);
  const rows = await db
    .select()
    .from(employees)
    .where(or(eq(employees.username, usernameOrEmail), eq(employees.email, usernameOrEmail)))
    .limit(1);
  const row = rows[0];
  if (!row || !row.isActive) return null;
  return row;
};

export const findManyEmployees = async (query: ListQuery = {}): Promise<PaginatedResult<EmployeeListItem>> => {
  logger.info(`Repository: Listing employees`);
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const offset = (page - 1) * limit;
  const orderColumn =
    query.sortBy && query.sortBy in sortColumnMap
      ? sortColumnMap[query.sortBy as keyof typeof sortColumnMap]
      : employees.createdAt;
  const order = query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

  const roleCondition = query.roleId ? eq(employees.roleId, query.roleId) : undefined;

  const countQuery = roleCondition
    ? db.select({ value: count(employees.id) }).from(employees).where(roleCondition)
    : db.select({ value: count(employees.id) }).from(employees);
  const [{ value: total }] = await countQuery;

  const rowsQuery = roleCondition
    ? db
        .select({
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          roleId: employees.roleId,
          profilePicture: employees.profilePicture,
        })
        .from(employees)
        .where(roleCondition)
        .orderBy(order)
        .limit(limit)
        .offset(offset)
    : db
        .select({
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          roleId: employees.roleId,
          profilePicture: employees.profilePicture,
        })
        .from(employees)
        .orderBy(order)
        .limit(limit)
        .offset(offset);
  const rows = await rowsQuery;

  const data: EmployeeListItem[] = rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    roleId: r.roleId,
    profilePicture: r.profilePicture ?? null,
  }));
  return { data, total: Number(total ?? 0), page, limit };
};

export const createEmployee = async (
  dto: CreateEmployeeDto,
  options?: { passwordHash?: string | null }
): Promise<Employee> => {
  logger.info(`Repository: Creating employee`);
  const [row] = await db
    .insert(employees)
    .values({
      username: dto.username ?? null,
      passwordHash: options?.passwordHash ?? null,
      firstName: dto.firstName,
      middleName: dto.middleName ?? null,
      lastName: dto.lastName,
      address: dto.address ?? null,
      phoneCountryCode: dto.phoneCountryCode ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      email: dto.email ?? null,
      ref: dto.ref ?? null,
      bankDetails: dto.bankDetails ?? null,
      pan: dto.pan ?? null,
      aadhaarDetails: dto.aadhaarDetails ?? null,
      upiId: dto.upiId ?? null,
      qrCode: dto.qrCode ?? null,
      joiningDate: dto.joiningDate != null ? new Date(dto.joiningDate) : null,
      leavingDate: dto.leavingDate != null ? new Date(dto.leavingDate) : null,
      roleId: dto.roleId ?? null,
      profilePicture: dto.profilePicture ?? null,
      isActive: dto.isActive ?? true,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};

export const updateEmployee = async (
  id: string,
  dto: UpdateEmployeeDto,
  options?: { passwordHash?: string | null }
): Promise<Employee> => {
  logger.info(`Repository: Updating employee`);
  const existing = await findEmployeeById(id);
  if (!existing) throw new NotFoundError("Employee not found");

  const [row] = await db
    .update(employees)
    .set({
      ...(dto.username !== undefined && { username: dto.username }),
      ...(options?.passwordHash !== undefined && { passwordHash: options.passwordHash }),
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.middleName !== undefined && { middleName: dto.middleName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phoneCountryCode !== undefined && { phoneCountryCode: dto.phoneCountryCode }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.ref !== undefined && { ref: dto.ref }),
      ...(dto.bankDetails !== undefined && { bankDetails: dto.bankDetails }),
      ...(dto.pan !== undefined && { pan: dto.pan }),
      ...(dto.aadhaarDetails !== undefined && { aadhaarDetails: dto.aadhaarDetails }),
      ...(dto.upiId !== undefined && { upiId: dto.upiId }),
      ...(dto.qrCode !== undefined && { qrCode: dto.qrCode }),
      ...(dto.joiningDate !== undefined && { joiningDate: dto.joiningDate != null ? new Date(dto.joiningDate) : null }),
      ...(dto.leavingDate !== undefined && { leavingDate: dto.leavingDate != null ? new Date(dto.leavingDate) : null }),
      ...(dto.roleId !== undefined && { roleId: dto.roleId }),
      ...(dto.profilePicture !== undefined && { profilePicture: dto.profilePicture }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(employees.id, id))
    .returning();
  if (!row) throw new Error("Update failed");
  return mapRow(row);
};

export const deleteEmployee = async (id: string): Promise<void> => {
  logger.info(`Repository: Deleting employee`);
  const result = await db.delete(employees).where(eq(employees.id, id)).returning({ id: employees.id });
  if (result.length === 0) throw new NotFoundError("Employee not found");
};
