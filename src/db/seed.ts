/**
 * Seed roles, permissions, role_permissions, and role_hierarchy.
 * Run after migrations. Uses schema enum values; no hardcoded role names for ability logic.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { roles, permissions, rolePermissions, roleHierarchy } from "./schema.js";
import type { RoleValue } from "../common/types.js";
import { logger } from "../lib/logger.js";

const ROLES: { value: RoleValue; name: string }[] = [
  { value: "SUPER_ADMIN", name: "Super Admin" },
  { value: "ADMIN", name: "Admin" },
  { value: "MANAGER", name: "Manager" },
  { value: "EMPLOYEE", name: "Employee" },
  { value: "ARTICLE", name: "Article" },
];

/** code, action, subject, scope */
const PERMISSION_SPECS: [string, string, string, "all" | "below" | "same_or_below" | null][] = [
  ["manage:all", "manage", "all", null],
  ["manage:firm", "manage", "Firm", null],
  ["manage:client", "manage", "Client", null],
  ["manage:family", "manage", "Family", null],
  ["read:user", "read", "User", null],
  ["read:report", "read", "Report", null],
  ["read:settings", "read", "Settings", null],
  ["read:employee", "read", "Employee", "same_or_below"],
  ["create:employee", "create", "Employee", "below"],
  ["update:employee", "update", "Employee", "below"],
  ["delete:employee", "delete", "Employee", "below"],
  ["read:role", "read", "Role", "same_or_below"],
  ["create:role", "create", "Role", null],
  ["update:role", "update", "Role", "below"],
  ["delete:role", "delete", "Role", "below"],
  ["read:firm", "read", "Firm", null],
  ["read:client", "read", "Client", null],
  ["read:family", "read", "Family", null],
  ["read:employee:any", "read", "Employee", null],
  ["read:role:any", "read", "Role", null],
  ["manage:assignment", "manage", "Assignment", null],
  ["read:assignment", "read", "Assignment", null],
  ["create:assignment", "create", "Assignment", null],
  ["update:assignment", "update", "Assignment", null],
  ["delete:assignment", "delete", "Assignment", null],
];

async function seed() {
  // 1) Ensure roles exist
  for (const { value, name } of ROLES) {
    const existing = await db.select().from(roles).where(eq(roles.value, value)).limit(1);
    if (existing.length === 0) {
      await db.insert(roles).values({ name, value, description: null });
    }
  }

  // 2) Ensure permissions exist
  for (const [code, action, subject, scope] of PERMISSION_SPECS) {
    const existing = await db.select().from(permissions).where(eq(permissions.code, code)).limit(1);
    if (existing.length === 0) {
      await db.insert(permissions).values({ code, action, subject, scope });
    }
  }

  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(permissions);
  const roleByValue = new Map(roleRows.map((r) => [r.value, r]));
  const permissionByCode = new Map(permissionRows.map((p) => [p.code, p]));

  // 3) Assign permissions to roles (idempotent: skip if link exists)
  // Permission model: 1) Super admin: all. 2) Admin: see all roles; create/edit/delete managers, employees, articles.
  // 3) Manager: see all roles; create/edit/delete only employees and articles. 4) Employee/Article: see all roles only.
  const rolePermissionAssignments: { roleValue: RoleValue; permissionCodes: string[] }[] = [
    { roleValue: "SUPER_ADMIN", permissionCodes: ["manage:all"] },
    {
      roleValue: "ADMIN",
      permissionCodes: [
        "manage:firm",
        "manage:client",
        "manage:family",
        "read:user",
        "read:report",
        "read:settings",
        "read:employee",
        "create:employee",
        "update:employee",
        "delete:employee",
        "read:role",
        "read:role:any",
        "create:role",
        "update:role",
        "delete:role",
        "manage:assignment",
      ],
    },
    {
      roleValue: "MANAGER",
      permissionCodes: [
        "manage:client",
        "manage:family",
        "read:user",
        "read:report",
        "read:settings",
        "read:employee",
        "create:employee",
        "update:employee",
        "delete:employee",
        "read:role",
        "read:role:any",
        "create:role",
        "update:role",
        "delete:role",
        "manage:assignment",
      ],
    },
    {
      roleValue: "EMPLOYEE",
      permissionCodes: [
        "read:firm",
        "read:client",
        "read:family",
        "read:employee:any",
        "read:role:any",
        "read:report",
        "read:assignment",
      ],
    },
    {
      roleValue: "ARTICLE",
      permissionCodes: [
        "read:firm",
        "read:client",
        "read:family",
        "read:employee:any",
        "read:role:any",
        "read:report",
        "read:assignment",
      ],
    },
  ];

  for (const { roleValue, permissionCodes } of rolePermissionAssignments) {
    const role = roleByValue.get(roleValue);
    if (!role) continue;
    const existingLinks = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
    for (const code of permissionCodes) {
      const perm = permissionByCode.get(code);
      if (!perm) continue;
      const alreadyHas = existingLinks.some((l) => l.permissionId === perm.id);
      if (!alreadyHas) {
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: perm.id });
      }
    }
  }

  // 4) Role hierarchy: each row is (child, parent). So ADMIN's descendants = MANAGER, EMPLOYEE, ARTICLE.
  //    Admin can therefore read/update/delete employees with Manager, Employee, or Article role.
  const hierarchyEdges: [RoleValue, RoleValue][] = [
    ["ADMIN", "SUPER_ADMIN"],
    ["MANAGER", "ADMIN"],
    ["EMPLOYEE", "MANAGER"],
    ["ARTICLE", "MANAGER"],
  ];

  for (const [childValue, parentValue] of hierarchyEdges) {
    const child = roleByValue.get(childValue);
    const parent = roleByValue.get(parentValue);
    if (!child || !parent) continue;
    const existing = await db.select().from(roleHierarchy).where(eq(roleHierarchy.roleId, child.id)).limit(1);
    if (existing.length === 0) {
      await db.insert(roleHierarchy).values({ roleId: child.id, parentRoleId: parent.id });
    }
  }

  logger.info("Seed complete: roles, permissions, role_permissions, role_hierarchy.");
  process.exit(0);
}

seed().catch((e) => {
  logger.error(`Seed failed: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
