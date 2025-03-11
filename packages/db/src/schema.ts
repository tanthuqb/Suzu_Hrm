// import { relations } from "drizzle-orm";
// import { pgTable, primaryKey } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

import { relations } from "drizzle-orm";
import {
  integer,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t
    .timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// export const User = pgTable("user", (t) => ({
//   id: t.uuid().notNull().primaryKey().defaultRandom(),
//   name: t.varchar({ length: 255 }),
//   email: t.varchar({ length: 255 }).notNull(),
//   emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
//   image: t.varchar({ length: 255 }),
// }));

// export const UserRelations = relations(User, ({ many }) => ({
//   accounts: many(Account),
// }));

// export const Account = pgTable(
//   "account",
//   (t) => ({
//     userId: t
//       .uuid()
//       .notNull()
//       .references(() => User.id, { onDelete: "cascade" }),
//     type: t
//       .varchar({ length: 255 })
//       .$type<"email" | "oauth" | "oidc" | "webauthn">()
//       .notNull(),
//     provider: t.varchar({ length: 255 }).notNull(),
//     providerAccountId: t.varchar({ length: 255 }).notNull(),
//     refresh_token: t.varchar({ length: 255 }),
//     access_token: t.text(),
//     expires_at: t.integer(),
//     token_type: t.varchar({ length: 255 }),
//     scope: t.varchar({ length: 255 }),
//     id_token: t.text(),
//     session_state: t.varchar({ length: 255 }),
//   }),
//   (account) => ({
//     compoundKey: primaryKey({
//       columns: [account.provider, account.providerAccountId],
//     }),
//   }),
// );

// export const AccountRelations = relations(Account, ({ one }) => ({
//   user: one(User, { fields: [Account.userId], references: [User.id] }),
// }));

// export const Session = pgTable("session", (t) => ({
//   sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
//   userId: t
//     .uuid()
//     .notNull()
//     .references(() => User.id, { onDelete: "cascade" }),
//   expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
// }));

// export const SessionRelations = relations(Session, ({ one }) => ({
//   user: one(User, { fields: [Session.userId], references: [User.id] }),
// }));

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
  supabaseUserId: uuid("supabase_user_id")
    .references(() => SupabaseUser.id)
    .notNull(),
  name: t.varchar("name", { length: 255 }).notNull(),
  email: t.varchar("email", { length: 255 }).notNull(),
  role: t.varchar("role", { length: 255 }).notNull(),
  status: t.varchar("status", { length: 255 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}));

export const CreateHRMUserSchema = createInsertSchema(HRMUser, {
  name: z.string().max(255),
  email: z.string().email().max(255),
  role: z.string().max(255),
  status: z.string().max(255),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

/** ACCOUNTS TABLE **/
export const Account = pgTable("accounts", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => HRMUser.id)
    .notNull(),
  accountType: varchar("account_type", { length: 255 }).notNull(),
  balance: integer("balance").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const CreateAccountSchema = createInsertSchema(Account, {
  userId: z.string(),
  accountType: z.string().max(255),
  balance: z.number().int(),
}).omit({
  id: true,
  createdAt: true,
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

/** RELATIONS **/
export const HRMUserRelations = relations(HRMUser, ({ many, one }) => ({
  salarySlips: many(SalarySlip),
  assets: many(Asset),
  transactions: many(Transaction),
  accounts: many(Account),
  supabaseUser: one(SupabaseUser, {
    fields: [HRMUser.supabaseUserId],
    references: [SupabaseUser.id],
  }),
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
    fields: [Transaction.id],
    references: [HRMUser.id],
  }),
}));

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(HRMUser, { fields: [Account.userId], references: [HRMUser.id] }),
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
  AccountRelations,
  WorkflowRelations,
  WorkflowStepRelations,
};
