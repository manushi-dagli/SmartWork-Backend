-- Second contact phone for inquiries (optional)
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "contact_phone_2_country_code" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "contact_phone_2_number" text;
