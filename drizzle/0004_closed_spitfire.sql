ALTER TABLE "employees" ADD COLUMN "profile_token" text;--> statement-breakpoint
ALTER TABLE "super_admins" ADD COLUMN "profile_token" text;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_profile_token_unique" UNIQUE("profile_token");--> statement-breakpoint
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_profile_token_unique" UNIQUE("profile_token");