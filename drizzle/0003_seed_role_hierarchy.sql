-- Seed role hierarchy: ADMIN -> SUPER_ADMIN, MANAGER -> ADMIN, EMPLOYEE -> MANAGER, ARTICLE -> MANAGER
INSERT INTO "role_hierarchy" ("role_id", "parent_role_id")
SELECT c.id, p.id FROM "roles" c, "roles" p
WHERE c.value = 'ADMIN' AND p.value = 'SUPER_ADMIN'
AND NOT EXISTS (SELECT 1 FROM "role_hierarchy" WHERE "role_id" = c.id);
--> statement-breakpoint
INSERT INTO "role_hierarchy" ("role_id", "parent_role_id")
SELECT c.id, p.id FROM "roles" c, "roles" p
WHERE c.value = 'MANAGER' AND p.value = 'ADMIN'
AND NOT EXISTS (SELECT 1 FROM "role_hierarchy" WHERE "role_id" = c.id);
--> statement-breakpoint
INSERT INTO "role_hierarchy" ("role_id", "parent_role_id")
SELECT c.id, p.id FROM "roles" c, "roles" p
WHERE c.value = 'EMPLOYEE' AND p.value = 'MANAGER'
AND NOT EXISTS (SELECT 1 FROM "role_hierarchy" WHERE "role_id" = c.id);
--> statement-breakpoint
INSERT INTO "role_hierarchy" ("role_id", "parent_role_id")
SELECT c.id, p.id FROM "roles" c, "roles" p
WHERE c.value = 'ARTICLE' AND p.value = 'MANAGER'
AND NOT EXISTS (SELECT 1 FROM "role_hierarchy" WHERE "role_id" = c.id);
