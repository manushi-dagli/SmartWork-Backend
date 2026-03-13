-- Firms: add country code; keep phone_number for 10-digit number
ALTER TABLE "firms" ADD COLUMN IF NOT EXISTS "phone_country_code" text;--> statement-breakpoint
-- Clients: add split phone columns, migrate existing data into number columns, drop old columns
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "phone_1_country_code" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "phone_1_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "phone_2_country_code" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "phone_2_number" text;--> statement-breakpoint
UPDATE "clients" SET "phone_1_number" = "phone_number_1" WHERE "phone_number_1" IS NOT NULL;--> statement-breakpoint
UPDATE "clients" SET "phone_2_number" = "phone_number_2" WHERE "phone_number_2" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN IF EXISTS "phone_number_1";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN IF EXISTS "phone_number_2";--> statement-breakpoint
-- Employees: add country code; keep phone_number for 10-digit number
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "phone_country_code" text;--> statement-breakpoint
-- Inquiries: add split contact phone columns, migrate existing data, drop old column
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "contact_phone_country_code" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "contact_phone_number" text;--> statement-breakpoint
UPDATE "inquiries" SET "contact_phone_number" = "contact_phone" WHERE "contact_phone" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "contact_phone";
