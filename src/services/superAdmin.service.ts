import bcrypt from "bcrypt";
import * as employeeRepo from "../repositories/employee.repository.js";
import * as superAdminRepo from "../repositories/superAdmin.repository.js";
import { ConflictError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

const SALT_ROUNDS = 10;

export interface CreateSuperAdminDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
}

export const createSuperAdmin = async (dto: CreateSuperAdminDto) => {
  logger.info("Service: Creating super admin");
  const existingEmployeeByUsername = await employeeRepo.findEmployeeByUsernameOrEmail(dto.username);
  const existingEmployeeByEmail =
    dto.email !== dto.username ? await employeeRepo.findEmployeeByUsernameOrEmail(dto.email) : existingEmployeeByUsername;
  if (existingEmployeeByUsername || existingEmployeeByEmail) {
    throw new ConflictError("A user with this username or email already exists");
  }
  const existingSuperByUsername = await superAdminRepo.findSuperAdminByUsernameOrEmail(dto.username);
  const existingSuperByEmail =
    dto.email !== dto.username ? await superAdminRepo.findSuperAdminByUsernameOrEmail(dto.email) : existingSuperByUsername;
  if (existingSuperByUsername || existingSuperByEmail) {
    throw new ConflictError("A super admin with this username or email already exists");
  }
  const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
  logger.info("Service: Persisting super admin");
  return superAdminRepo.createSuperAdmin({
    username: dto.username,
    email: dto.email,
    passwordHash,
    firstName: dto.firstName,
    lastName: dto.lastName,
    middleName: dto.middleName ?? null,
  });
};
