import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type RawRuleOf,
} from "@casl/ability";
import type { Role } from "./auth.js";
import { getAuthLevel } from "./hierarchy.js";

export type Actions = "create" | "read" | "update" | "delete" | "manage";
export type Subjects =
  | "Firm"
  | "Role"
  | "Client"
  | "Family"
  | "Employee"
  | "User"
  | "Report"
  | "Settings"
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

/**
 * Subject shape for permission conditions: pass roleId (subject's role) or assignRoleId (for create).
 * detectSubjectType returns subject.type.
 */
export type EmployeeSubject = { type: "Employee"; roleId?: string | null; assignRoleId?: string | null };
export type RoleSubject = { type: "Role"; roleId?: string };

/**
 * Hierarchy: super_admin > admin > manager > staff > viewer.
 * Conditional rules: can only manage (read/update/delete) Employee/Role when subject's roleLevel < current user's level.
 * Create: can only assign role level below yours (assignRoleLevel < level).
 */
export function defineAbilityFor(role: Role): AppAbility {
  const level = getAuthLevel(role);
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Conditions: only allow action when subject's roleLevel is strictly below current user's level (CASL Mongo-style)
  const belowLevel = { roleLevel: { $lt: level } };
  const assignBelowLevel = { assignRoleLevel: { $lt: level } };
  // Type assertion for CASL conditions (MongoQuery); cond accepts both shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cond = (c: Record<string, unknown>) => c as any;

  switch (role) {
    case "super_admin":
      can("manage", "all");
      break;
    case "admin":
      can("manage", "Firm");
      can("manage", "Client");
      can("manage", "Family");
      can("read", "User");
      can("read", "Report");
      can("read", "Settings");
      can("read", "Employee", cond(belowLevel));
      can("update", "Employee", cond(belowLevel));
      can("delete", "Employee", cond(belowLevel));
      can("create", "Employee", cond(assignBelowLevel));
      can("read", "Role", cond(belowLevel));
      can("update", "Role", cond(belowLevel));
      can("delete", "Role", cond(belowLevel));
      can("create", "Role", cond(assignBelowLevel));
      break;
    case "manager":
      can("manage", "Firm");
      can("manage", "Client");
      can("manage", "Family");
      can("read", "User");
      can("read", "Report");
      can("read", "Settings");
      can("read", "Employee", cond(belowLevel));
      can("update", "Employee", cond(belowLevel));
      can("delete", "Employee", cond(belowLevel));
      can("create", "Employee", cond(assignBelowLevel));
      can("read", "Role", cond(belowLevel));
      can("update", "Role", cond(belowLevel));
      can("delete", "Role", cond(belowLevel));
      can("create", "Role", cond(assignBelowLevel));
      break;
    case "staff":
      can("read", "Firm");
      can("read", "Role");
      can("read", "Client");
      can("create", "Client");
      can("update", "Client");
      can("read", "Family");
      can("read", "Employee", cond(belowLevel));
      can("create", "Employee", cond(assignBelowLevel));
      can("update", "Employee", cond(belowLevel));
      can("read", "Report");
      break;
    case "viewer":
      can("read", "Firm");
      can("read", "Role");
      can("read", "Client");
      can("read", "Family");
      can("read", "Employee");
      can("read", "Report");
      break;
    default:
      can("read", "Firm");
      can("read", "Role");
      can("read", "Client");
      can("read", "Family");
      can("read", "Employee");
  }

  return build({
    detectSubjectType: (subject) =>
      typeof subject === "object" && subject !== null && "type" in subject
        ? ((subject as { type: string }).type as Subjects)
        : (subject as Subjects),
  });
}

export function createAbilityFromRules(rules: RawRuleOf<AppAbility>[]): AppAbility {
  return createMongoAbility<AppAbility>(rules);
}

export type PermissionLike = { action: string; subject: string; scope: string | null };

/**
 * Build CASL ability from role's permissions (from DB). No hardcoded role names.
 * For scope "below": subject's roleId must be in descendantRoleIds.
 * For scope "same_or_below": subject's roleId must be current roleId or in descendantRoleIds.
 * For create actions we use assignRoleId; for read/update/delete we use roleId.
 */
export function defineAbilityFromRolePermissions(
  roleId: string,
  perms: PermissionLike[],
  descendantRoleIds: string[]
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  const sameOrBelowIds = [roleId, ...descendantRoleIds];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cond = (c: Record<string, unknown>) => c as any;

  for (const p of perms) {
    const action = p.action as Actions;
    const subject = (p.subject === "all" ? "all" : p.subject) as Subjects;
    if (action === "manage" && subject === "all") {
      can("manage", "all");
      continue;
    }
    if (!p.scope || p.scope === "all") {
      can(action, subject);
      continue;
    }
    // Scope "below" or "same_or_below": condition on roleId (for read/update/delete) or assignRoleId (for create)
    const allowedIds = p.scope === "below" ? descendantRoleIds : sameOrBelowIds;
    const roleIdCond = { roleId: { $in: allowedIds } };
    const assignRoleIdCond = { assignRoleId: { $in: allowedIds } };
    // For "read": allow list (no subject) so GET /api/roles and GET /api/employees succeed
    if (action === "read") {
      can("read", subject);
      can("read", subject, cond(roleIdCond));
    } else if (action === "create") {
      can(action, subject, cond(assignRoleIdCond));
    } else {
      can(action, subject, cond(roleIdCond));
    }
  }

  return build({
    detectSubjectType: (subject) =>
      typeof subject === "object" && subject !== null && "type" in subject
        ? ((subject as { type: string }).type as Subjects)
        : (subject as Subjects),
  });
}
