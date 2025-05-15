ALTER TABLE "department_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "department_users" CASCADE;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "office" SET DEFAULT 'No Trang Long';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_position_id_roles_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "public"."departments" ALTER COLUMN "office" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."office";--> statement-breakpoint
CREATE TYPE "public"."office" AS ENUM('No Trang Long', 'Sky');--> statement-breakpoint
ALTER TABLE "public"."departments" ALTER COLUMN "office" SET DATA TYPE "public"."office" USING "office"::"public"."office";