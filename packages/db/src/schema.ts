import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { AttendanceStatus } from "./constants/attendance";

/** Helper convert enum */
export const enumValues = <E extends Record<string, string>>(
  e: E,
): [string, ...string[]] => {
  if (!e || typeof e !== "object") {
    throw new Error("Invalid enum object passed");
  }

  const values = Object.values(e);
  if (values.length === 0) {
    throw new Error("Enum must have at least one value");
  }

  return values as [string, ...string[]];
};

/** Supabase Auth Schema */
const auth = pgSchema("auth");

export const SupabaseUser = auth.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/** USERS TABLE - KHÔNG dùng defaultRandom để khớp Supabase ID */
export const HRMUser = pgTable("users", (t) => ({
  id: uuid("id").primaryKey().notNull(),
  employeeCode: t.varchar("employee_code", { length: 255 }).notNull(),
  name: t.varchar("name", { length: 255 }).notNull(),
  firstName: t.varchar("firstName", { length: 255 }).notNull(),
  lastName: t.varchar("lastName", { length: 255 }).notNull(),
  email: t.varchar("email", { length: 255 }).notNull(),
  role: t.varchar("role", { length: 255 }).notNull(),
  phone: t.varchar("phone", { length: 255 }).notNull(),
  status: t.varchar("status", { length: 255 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}));

export const CreateUserSchemaInput = createInsertSchema(HRMUser, {
  id: z.string().uuid().optional(),
  employeeCode: z.string().max(255),
  name: z.string().max(255),
  firstName: z.string().max(255),
  lastName: z.string().max(255),
  email: z.string().email().max(255),
  role: z.string().max(255),
  phone: z.string().max(255),
  status: z.string().max(255),
}).omit({
  createdAt: true,
  updatedAt: true,
});

/** SALARY SLIP TABLE **/
export const SalarySlip = pgTable("salary_slips", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => HRMUser.id)
    .notNull(),
  month: varchar("month", { length: 10 }).notNull(),

  // Thu nhập
  basicSalary: integer("basic_salary").notNull(),
  workingSalary: integer("working_salary").notNull(),
  bonus: integer("bonus").default(0),
  allowance: integer("allowance").default(0),
  otherIncome: integer("other_income").default(0),
  totalIncome: integer("total_income").notNull(),

  // Khấu trừ
  socialInsuranceBase: integer("social_insurance_base"),
  socialInsuranceDeducted: integer("social_insurance_deduction"),
  unionFee: integer("union_fee"),
  taxableIncome: integer("taxable_income"),
  personalDeduction: integer("personal_deduction"),
  familyDeduction: integer("family_deduction"),
  taxIncomeFinal: integer("tax_income_final"),
  personalIncomeTax: integer("personal_income_tax"),
  advance: integer("advance"),
  otherDeductions: integer("other_deductions"),
  totalDeductions: integer("total_deductions"),

  // Thực lãnh
  netIncome: integer("net_income").notNull(),

  // Trạng thái, tạo lúc nào
  status: varchar("status", { length: 255 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type SalarySlipRecord = InferSelectModel<typeof SalarySlip>;

export const CreateSalarySlipSchema = createInsertSchema(SalarySlip, {
  userId: z.string(),
  month: z.string().max(10),
  basicSalary: z.number().int(),
  workingSalary: z.number().int(),
  bonus: z.number().int(),
  allowance: z.number().int(),
  otherIncome: z.number().int(),
  totalIncome: z.number().int(),
  socialInsuranceBase: z.number().int(),
  // optional
  socialInsuranceDeducted: z.number().int().optional(),
  unionFee: z.number().int().optional(),
  taxableIncome: z.number().int().optional(),
  personalDeduction: z.number().int().optional(),
  familyDeduction: z.number().int().optional(),
  taxIncomeFinal: z.number().int().optional(),
  personalIncomeTax: z.number().int().optional(),
  advance: z.number().int().optional(),
  otherDeductions: z.number().int().optional(),
  totalDeductions: z.number().int().optional(),
  netIncome: z.number().int(),
  status: z.string().max(255),
}).omit({
  id: true,
  createdAt: true,
});

/** ASSETS TABLE **/
export const Asset = pgTable("assets", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: t.varchar("name", { length: 255 }).notNull(),
  type: t.varchar("type", { length: 255 }),
  assignedTo: uuid("assigned_to").references(() => HRMUser.id),
  status: t.varchar("status", { length: 255 }).default("in-use"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateAssetSchema = createInsertSchema(Asset, {
  name: z.string().max(255),
  type: z.string().max(255),
  assignedTo: z.string(),
  status: z.string().max(255),
}).omit({
  id: true,
  createdAt: true,
});

/** TRANSACTIONS TABLE **/
export const Transaction = pgTable("transactions", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id),
  transactionType: varchar("transaction_type", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  transactionDate: timestamp("transaction_date", {
    withTimezone: true,
  }).defaultNow(),
  description: text("description"),
  status: varchar("status", { length: 255 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateTransactionSchema = createInsertSchema(Transaction, {
  transactionType: z.string().max(255),
  amount: z.number().int(),
  transactionDate: z.string(),
  description: z.string().max(255),
  status: z.string().max(255),
}).omit({
  id: true,
  createdAt: true,
  transactionDate: true,
});

/** WORKFLOW TABLE **/
export const Workflow = pgTable("workflows", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateWorkflowSchema = createInsertSchema(Workflow).omit({
  id: true,
  createdAt: true,
});

/** WORKFLOW STEPS **/
export const WorkflowStep = pgTable("workflow_steps", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  workflowId: uuid("workflow_id")
    .references(() => Workflow.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  stepOrder: integer("step_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateWorkflowStepSchema = createInsertSchema(WorkflowStep, {
  workflowId: z.string(),
  name: z.string().max(255),
  description: z.string().max(255),
  stepOrder: z.number().int(),
}).omit({
  id: true,
  createdAt: true,
});

/** NOTIFICATION */
export const Notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").default(false).notNull(),
  time: timestamp("time", { mode: "string" }).defaultNow().notNull(),
});

/** LEAVE REQUEST */
export const LeaveRequests = pgTable("leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  userId: uuid("user_id").notNull(), // vì HRMUser.id là uuid
  department: text("department").notNull(),

  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),

  reason: text("reason").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const CreateLeaveRequestsSchema = createInsertSchema(LeaveRequests, {
  name: z.string().max(255),
  userId: z.string().uuid(),
  department: z.string().max(255),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(255),
}).omit({
  id: true,
  createdAt: true,
});

/**  ATTENDANCES  */
export const attendanceStatusEnum = pgEnum(
  "attendance_status",
  enumValues(AttendanceStatus),
);

export const Attendance = pgTable("attendances", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  status: attendanceStatusEnum("status").notNull(),
});

/** RELATIONS **/
export const leaveRequestsRelations = relations(LeaveRequests, ({ one }) => ({
  user: one(HRMUser, {
    fields: [LeaveRequests.userId],
    references: [HRMUser.id],
  }),
}));

export const HRMUserRelations = relations(HRMUser, ({ many }) => ({
  salarySlips: many(SalarySlip),
  assets: many(Asset),
  transactions: many(Transaction),
  leaveRequests: many(LeaveRequests),
  attendances: many(Attendance),
}));

export const SalarySlipRelations = relations(SalarySlip, ({ one }) => ({
  user: one(HRMUser, { fields: [SalarySlip.userId], references: [HRMUser.id] }),
}));

export const AssetRelations = relations(Asset, ({ one }) => ({
  assignedUser: one(HRMUser, {
    fields: [Asset.assignedTo],
    references: [HRMUser.id],
  }),
}));

export const TransactionRelations = relations(Transaction, ({ one }) => ({
  user: one(HRMUser, {
    fields: [Transaction.userId],
    references: [HRMUser.id],
  }),
}));

export const WorkflowRelations = relations(Workflow, ({ many }) => ({
  steps: many(WorkflowStep),
}));

export const WorkflowStepRelations = relations(WorkflowStep, ({ one }) => ({
  workflow: one(Workflow, {
    fields: [WorkflowStep.workflowId],
    references: [Workflow.id],
  }),
}));

export const AttendanceRelations = relations(Attendance, ({ one }) => ({
  user: one(HRMUser, {
    fields: [Attendance.userId],
    references: [HRMUser.id],
  }),
}));

export default {
  HRMUserRelations,
  SalarySlipRelations,
  AssetRelations,
  TransactionRelations,
  WorkflowRelations,
  WorkflowStepRelations,
  AttendanceRelations,
};
