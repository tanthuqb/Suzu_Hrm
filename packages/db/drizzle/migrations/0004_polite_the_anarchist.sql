ALTER TABLE "attendances" DROP CONSTRAINT "attendances_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_user_id_date_pk";--> statement-breakpoint
ALTER TABLE "attendances" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_user_date" ON "attendances" USING btree ("user_id","date");