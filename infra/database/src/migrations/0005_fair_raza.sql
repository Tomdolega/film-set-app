CREATE TYPE "public"."notification_severity" AS ENUM('info', 'warning', 'conflict');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('project_update', 'crew_assignment', 'shooting_day_update', 'schedule_conflict', 'document_uploaded', 'equipment_update', 'generic');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid,
	"type" "notification_type" DEFAULT 'generic' NOT NULL,
	"severity" "notification_severity" DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link_path" text,
	"related_entity_type" text,
	"related_entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_created_at_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_is_read_idx" ON "notifications" USING btree ("user_id","is_read");