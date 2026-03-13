import bcrypt from "bcrypt";
import type { Employee, EmployeeListItem, CreateEmployeeDto, UpdateEmployeeDto, ListQuery, PaginatedResult } from "../common/types.js";
import type { AppAbility } from "../lib/ability.js";
import * as employeeRepo from "../repositories/employee.repository.js";
import * as superAdminRepo from "../repositories/superAdmin.repository.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../common/errors.js";

const SALT_ROUNDS = 10;

export const listEmployees = async (query: ListQuery): Promise<PaginatedResult<EmployeeListItem>> =>
  employeeRepo.findManyEmployees(query);

/** Check if a username is available (not taken by any employee or super admin). excludeId = current employee id when editing. */
export const checkUsernameAvailable = async (
  username: string,
  excludeId?: string
): Promise<{ available: boolean }> => {
  const trimmed = username?.trim();
  if (!trimmed) return { available: true };
  const existingEmployee = await employeeRepo.findEmployeeByUsername(trimmed, excludeId);
  if (existingEmployee) return { available: false };
  const existingSuper = await superAdminRepo.findSuperAdminByUsernameOrEmail(trimmed);
  if (existingSuper) return { available: false };
  return { available: true };
};

export const getEmployeeById = async (id: string, ability: AppAbility): Promise<Employee> => {
  const employee = await employeeRepo.findEmployeeById(id);
  if (!employee) throw new NotFoundError("Employee not found");
  if (!ability.can("read", { type: "Employee", roleId: employee.roleId } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot view this employee");
  }
  return employee;
};

export const createEmployee = async (dto: CreateEmployeeDto, ability: AppAbility): Promise<Employee> => {
  if (!ability.can("create", { type: "Employee", assignRoleId: dto.roleId ?? null } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot assign this role to an employee");
  }
  const usernameTrimmed = dto.username?.trim();
  if (usernameTrimmed) {
    const existingEmployee = await employeeRepo.findEmployeeByUsername(usernameTrimmed);
    if (existingEmployee) throw new ConflictError("Username already taken");
    const existingSuper = await superAdminRepo.findSuperAdminByUsernameOrEmail(usernameTrimmed);
    if (existingSuper) throw new ConflictError("Username already taken");
  }
  const passwordHash =
    dto.password != null && dto.password !== ""
      ? await bcrypt.hash(dto.password, SALT_ROUNDS)
      : undefined;
  const { password: _p, ...rest } = dto;
  return employeeRepo.createEmployee(rest, { passwordHash });
};

export const updateEmployee = async (id: string, dto: UpdateEmployeeDto, ability: AppAbility): Promise<Employee> => {
  const existing = await employeeRepo.findEmployeeById(id);
  if (!existing) throw new NotFoundError("Employee not found");
  if (!ability.can("update", { type: "Employee", roleId: existing.roleId } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot edit this employee");
  }
  if (dto.roleId !== undefined && dto.roleId != null) {
    if (!ability.can("update", { type: "Employee", assignRoleId: dto.roleId } as unknown as Parameters<AppAbility["can"]>[1])) {
      throw new ForbiddenError("You cannot assign this role to an employee");
    }
  }
  const usernameTrimmed = dto.username?.trim();
  if (usernameTrimmed) {
    const existingEmployee = await employeeRepo.findEmployeeByUsername(usernameTrimmed, id);
    if (existingEmployee) throw new ConflictError("Username already taken");
    const existingSuper = await superAdminRepo.findSuperAdminByUsernameOrEmail(usernameTrimmed);
    if (existingSuper) throw new ConflictError("Username already taken");
  }
  const passwordHash =
    dto.password != null && dto.password !== ""
      ? await bcrypt.hash(dto.password, SALT_ROUNDS)
      : undefined;
  const { password: _p, ...rest } = dto;
  return employeeRepo.updateEmployee(id, rest, passwordHash !== undefined ? { passwordHash } : undefined);
};

export const deleteEmployee = async (id: string, ability: AppAbility): Promise<void> => {
  const employee = await employeeRepo.findEmployeeById(id);
  if (!employee) throw new NotFoundError("Employee not found");
  if (!ability.can("delete", { type: "Employee", roleId: employee.roleId } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot delete this employee");
  }
  return employeeRepo.deleteEmployee(id);
};

/** Update own profile (no ability check). Disallows roleId and isActive changes. */
export const updateEmployeeSelf = async (id: string, dto: UpdateEmployeeDto): Promise<Employee> => {
  const existing = await employeeRepo.findEmployeeById(id);
  if (!existing) throw new NotFoundError("Employee not found");
  const { roleId: _r, isActive: _a, ...safeDto } = dto;
  const usernameTrimmed = safeDto.username?.trim();
  if (usernameTrimmed) {
    const existingEmployee = await employeeRepo.findEmployeeByUsername(usernameTrimmed, id);
    if (existingEmployee) throw new ConflictError("Username already taken");
    const existingSuper = await superAdminRepo.findSuperAdminByUsernameOrEmail(usernameTrimmed);
    if (existingSuper) throw new ConflictError("Username already taken");
  }
  const passwordHash =
    safeDto.password != null && safeDto.password !== ""
      ? await bcrypt.hash(safeDto.password, SALT_ROUNDS)
      : undefined;
  const { password: _p, ...rest } = safeDto;
  return employeeRepo.updateEmployee(id, rest, passwordHash !== undefined ? { passwordHash } : undefined);
};
