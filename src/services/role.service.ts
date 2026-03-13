import type { Role as AppRole, CreateRoleDto, UpdateRoleDto } from "../common/types.js";
import type { AppAbility } from "../lib/ability.js";
import * as roleRepo from "../repositories/role.repository.js";
import { NotFoundError, ForbiddenError } from "../common/errors.js";

export const listRoles = async (): Promise<AppRole[]> => roleRepo.findManyRoles();

export const getRoleById = async (id: string, ability: AppAbility): Promise<AppRole> => {
  const role = await roleRepo.findRoleById(id);
  if (!role) throw new NotFoundError("Role not found");
  if (!ability.can("read", { type: "Role", roleId: role.id } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot view this role");
  }
  return role;
};

export const createRole = async (dto: CreateRoleDto, ability: AppAbility): Promise<AppRole> => {
  if (!ability.can("create", "Role")) {
    throw new ForbiddenError("You cannot create a role");
  }
  return roleRepo.createRole(dto);
};

export const updateRole = async (id: string, dto: UpdateRoleDto, ability: AppAbility): Promise<AppRole> => {
  const existing = await roleRepo.findRoleById(id);
  if (!existing) throw new NotFoundError("Role not found");
  if (!ability.can("update", { type: "Role", roleId: existing.id } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot edit this role");
  }
  return roleRepo.updateRole(id, dto);
};

export const deleteRole = async (id: string, ability: AppAbility): Promise<void> => {
  const role = await roleRepo.findRoleById(id);
  if (!role) throw new NotFoundError("Role not found");
  if (!ability.can("delete", { type: "Role", roleId: role.id } as unknown as Parameters<AppAbility["can"]>[1])) {
    throw new ForbiddenError("You cannot delete this role");
  }
  return roleRepo.deleteRole(id);
};
