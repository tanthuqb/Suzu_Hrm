ALTER TABLE "departments" ALTER COLUMN "office" SET DEFAULT 'NTL';--> statement-breakpoint
ALTER TABLE "public"."departments" ALTER COLUMN "office" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."office";--> statement-breakpoint
CREATE TYPE "public"."office" AS ENUM('SKY', 'NTL');--> statement-breakpoint
ALTER TABLE "public"."departments" ALTER COLUMN "office" SET DATA TYPE "public"."office" USING "office"::"public"."office";