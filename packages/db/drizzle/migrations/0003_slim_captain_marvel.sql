ALTER TYPE "public"."attendance_status" ADD VALUE 'W' BEFORE 'P';--> statement-breakpoint
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_user_id_start_date_pk";--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_date_pk" PRIMARY KEY("user_id","date");--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "attendances" DROP COLUMN "start_date";