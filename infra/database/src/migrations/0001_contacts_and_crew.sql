CREATE TYPE "public"."contact_type" AS ENUM('person', 'vendor', 'company');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"type" "contact_type" DEFAULT 'person' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" RENAME COLUMN "role" TO "access_role";--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "project_role" text;--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "project_members" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_user_unique" UNIQUE("project_id","user_id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_contact_unique" UNIQUE("project_id","contact_id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_person_reference_check" CHECK (((case when "project_members"."user_id" is not null then 1 else 0 end) + (case when "project_members"."contact_id" is not null then 1 else 0 end)) = 1);--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
