import { eq, inArray } from "drizzle-orm";
import type { Permission, PermissionScope } from "../common/types.js";
import { permissions, rolePermissions, roleHierarchy } from "../db/schema.js";
import { db } from "../config/database.js";

/** In-memory cache for role permissions + descendants (used on every auth request). TTL 60s. */
const CACHE_TTL_MS = 60_000;
const rolePermissionCache = new Map<
  string,
  { permissions: Permission[]; descendantIds: string[]; expiresAt: number }
>();

/** Cached full role_hierarchy table to avoid DB round-trip on every cold auth. Refresh every 2 min. */
const HIERARCHY_CACHE_TTL_MS = 120_000;
let hierarchyCache: { rows: { parentRoleId: string; roleId: string }[]; expiresAt: number } | null = null;

async function getRoleHierarchyRows(): Promise<{ parentRoleId: string; roleId: string }[]> {
  if (hierarchyCache && Date.now() <= hierarchyCache.expiresAt) return hierarchyCache.rows;
  const rows = await db.select().from(roleHierarchy);
  const mapped = rows.map((r) => ({ parentRoleId: r.parentRoleId, roleId: r.roleId }));
  hierarchyCache = { rows: mapped, expiresAt: Date.now() + HIERARCHY_CACHE_TTL_MS };
  return mapped;
}

function getCachedRolePermission(roleId: string): { permissions: Permission[]; descendantIds: string[] } | null {
  const entry = rolePermissionCache.get(roleId);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return { permissions: entry.permissions, descendantIds: entry.descendantIds };
}

function setCachedRolePermission(roleId: string, permissions: Permission[], descendantIds: string[]): void {
  rolePermissionCache.set(roleId, {
    permissions,
    descendantIds,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function mapPermission(row: typeof permissions.$inferSelect): Permission {
  return {
    id: row.id,
    code: row.code,
    action: row.action,
    subject: row.subject,
    scope: row.scope as PermissionScope | null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const findPermissionById = async (id: string): Promise<Permission | null> => {
  const rows = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapPermission(row);
};

export const findPermissionByCode = async (code: string): Promise<Permission | null> => {
  const rows = await db.select().from(permissions).where(eq(permissions.code, code)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapPermission(row);
};

export const findAllPermissions = async (): Promise<Permission[]> => {
  const rows = await db.select().from(permissions);
  return rows.map(mapPermission);
};

/** Permissions assigned to a role (from role_permissions). Cached 60s for auth performance. */
export const findPermissionsByRoleId = async (roleId: string): Promise<Permission[]> => {
  const cached = getCachedRolePermission(roleId);
  if (cached) return cached.permissions;
  const links = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));
  if (links.length === 0) {
    const descendantIds = await getDescendantRoleIdsFromDb(roleId);
    setCachedRolePermission(roleId, [], descendantIds);
    return [];
  }
  const rows = await db
    .select()
    .from(permissions)
    .where(inArray(permissions.id, links.map((l) => l.permissionId)));
  const result = rows.map(mapPermission);
  const descendantIds = await getDescendantRoleIdsFromDb(roleId);
  setCachedRolePermission(roleId, result, descendantIds);
  return result;
};

/**
 * Role IDs that are "below" the given role in the hierarchy tree (descendants).
 * Used for permission scope "below" / "same_or_below". Cached 60s when used with findPermissionsByRoleId.
 */
export const getDescendantRoleIds = async (roleId: string): Promise<string[]> => {
  const cached = getCachedRolePermission(roleId);
  if (cached) return cached.descendantIds;
  return getDescendantRoleIdsFromDb(roleId);
};

async function getDescendantRoleIdsFromDb(roleId: string): Promise<string[]> {
  const rows = await getRoleHierarchyRows();
  const childrenByParent = new Map<string, string[]>();
  for (const r of rows) {
    const list = childrenByParent.get(r.parentRoleId) ?? [];
    list.push(r.roleId);
    childrenByParent.set(r.parentRoleId, list);
  }
  const descendantIds: string[] = [];
  let queue: string[] = [roleId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenByParent.get(current) ?? [];
    for (const c of children) {
      descendantIds.push(c);
      queue.push(c);
    }
  }
  return descendantIds;
}
