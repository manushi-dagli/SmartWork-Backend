ALTER TABLE "employees" DROP CONSTRAINT "employees_profile_token_unique";--> statement-breakpoint
ALTER TABLE "super_admins" DROP CONSTRAINT "super_admins_profile_token_unique";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "profile_token";--> statement-breakpoint
ALTER TABLE "super_admins" DROP COLUMN "profile_token";