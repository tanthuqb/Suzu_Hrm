CREATE TYPE "public"."office" AS ENUM('Nơ Trang Long', 'Sky');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TABLE "department_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "office" "office" DEFAULT 'Nơ Trang Long';--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "module" text NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "allow" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "department_users" ADD CONSTRAINT "department_users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_users" ADD CONSTRAINT "department_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "manager_id";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "created_by_id";