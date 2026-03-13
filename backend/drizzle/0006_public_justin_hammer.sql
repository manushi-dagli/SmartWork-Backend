CREATE TYPE "public"."inquiry_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "assignment_term_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_type_id" uuid,
	"name" text NOT NULL,
	"content" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"assignment_type_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inquiry_status" DEFAULT 'PENDING' NOT NULL,
	"assignment_type_id" uuid NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"client_id" uuid,
	"assignment_terms_snapshot" jsonb,
	"payment_terms_snapshot" jsonb,
	"assignment_term_template_id" uuid,
	"payment_term_template_id" uuid,
	"emailed_at" timestamp with time zone,
	"whatsapp_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_documents" (
	"inquiry_id" uuid NOT NULL,
	"document_master_id" uuid NOT NULL,
	CONSTRAINT "inquiry_documents_inquiry_id_document_master_id_pk" PRIMARY KEY("inquiry_id","document_master_id")
);
--> statement-breakpoint
CREATE TABLE "payment_term_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_type_id" uuid,
	"name" text NOT NULL,
	"content" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment_term_templates" ADD CONSTRAINT "assignment_term_templates_assignment_type_id_assignment_types_id_fk" FOREIGN KEY ("assignment_type_id") REFERENCES "public"."assignment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_master" ADD CONSTRAINT "document_master_assignment_type_id_assignment_types_id_fk" FOREIGN KEY ("assignment_type_id") REFERENCES "public"."assignment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignment_type_id_assignment_types_id_fk" FOREIGN KEY ("assignment_type_id") REFERENCES "public"."assignment_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignment_term_template_id_assignment_term_templates_id_fk" FOREIGN KEY ("assignment_term_template_id") REFERENCES "public"."assignment_term_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_payment_term_template_id_payment_term_templates_id_fk" FOREIGN KEY ("payment_term_template_id") REFERENCES "public"."payment_term_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_documents" ADD CONSTRAINT "inquiry_documents_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_documents" ADD CONSTRAINT "inquiry_documents_document_master_id_document_master_id_fk" FOREIGN KEY ("document_master_id") REFERENCES "public"."document_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_term_templates" ADD CONSTRAINT "payment_term_templates_assignment_type_id_assignment_types_id_fk" FOREIGN KEY ("assignment_type_id") REFERENCES "public"."assignment_types"("id") ON DELETE set null ON UPDATE no action;