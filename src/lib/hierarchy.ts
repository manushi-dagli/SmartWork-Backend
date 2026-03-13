/**
 * Hierarchy levels for auth roles and app roles.
 * App role level comes from the DB (roles.level); no hardcoded role names.
 */

import type { Role } from "./auth.js";

/** Auth role level (higher = more privileged). */
const AUTH_LEVEL: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
  viewer: 0,
};

export function getAuthLevel(role: Role): number {
  return AUTH_LEVEL[role] ?? 0;
}

