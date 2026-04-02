CREATE TYPE "public"."equipment_category" AS ENUM('camera', 'lens', 'audio', 'light', 'grip', 'accessory', 'other');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('available', 'reserved', 'checked_out', 'maintenance', 'unavailable');--> statement-breakpoint
CREATE TABLE "equipment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "equipment_category" DEFAULT 'other' NOT NULL,
	"status" "equipment_status" DEFAULT 'available' NOT NULL,
	"description" text,
	"serial_number" text,
	"notes" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;