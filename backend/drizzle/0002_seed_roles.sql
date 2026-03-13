-- Seed roles from schema enum: SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, ARTICLE
INSERT INTO "roles" ("name", "value", "description")
SELECT 'Super Admin', 'SUPER_ADMIN'::"role_value", NULL
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "value" = 'SUPER_ADMIN');
--> statement-breakpoint
INSERT INTO "roles" ("name", "value", "description")
SELECT 'Admin', 'ADMIN'::"role_value", NULL
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "value" = 'ADMIN');
--> statement-breakpoint
INSERT INTO "roles" ("name", "value", "description")
SELECT 'Manager', 'MANAGER'::"role_value", NULL
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "value" = 'MANAGER');
--> statement-breakpoint
INSERT INTO "roles" ("name", "value", "description")
SELECT 'Employee', 'EMPLOYEE'::"role_value", NULL
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "value" = 'EMPLOYEE');
--> statement-breakpoint
INSERT INTO "roles" ("name", "value", "description")
SELECT 'Article', 'ARTICLE'::"role_value", NULL
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "value" = 'ARTICLE');
