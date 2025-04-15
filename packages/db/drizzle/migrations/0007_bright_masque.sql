ALTER TABLE "salary_slips" RENAME COLUMN "total_amount" TO "basic_salary";--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "working_salary" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "bonus" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "allowance" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "other_income" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "total_income" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "social_insurance_base" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "social_insurance_deduction" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "union_fee" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "taxable_income" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "personal_deduction" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "family_deduction" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "tax_income_final" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "personal_income_tax" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "advance" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "other_deductions" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "total_deductions" integer;--> statement-breakpoint
ALTER TABLE "salary_slips" ADD COLUMN "net_income" integer NOT NULL;