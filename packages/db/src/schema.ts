import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
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

/** Supabase Auth Schema **/
const auth = pgSchema("auth");

export const SupabaseUser = auth.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/** USERS TABLE **/
export const HRMUser = pgTable("users", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
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

/** SALARY SLIP TABLE **/
export const SalarySlip = pgTable("salary_slips", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => HRMUser.id)
    .notNull(),
  month: varchar("month", { length: 10 }).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", { length: 255 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateSalarySlipSchema = createInsertSchema(SalarySlip, {
  userId: z.string(),
  month: z.string().max(10),
  totalAmount: z.number().int(),
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

export default {
  HRMUserRelations,
  SalarySlipRelations,
  AssetRelations,
  TransactionRelations,
  WorkflowRelations,
  WorkflowStepRelations,
};
