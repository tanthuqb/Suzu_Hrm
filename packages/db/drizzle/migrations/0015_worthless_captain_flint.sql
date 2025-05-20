ALTER TABLE "attendances" ADD COLUMN "is_remote" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "remote_reason" text;--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "approval_status" varchar(255) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;