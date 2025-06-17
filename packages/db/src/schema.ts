import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  approvalStatusEnumValues,
  attendanceStatusEnumValues,
} from "./constants";
import { postStatusValues } from "./constants/post-status";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "1",
  "P",
  "P1",
  "Pk",
  "L",
  "Nb",
  "W",
]);
export const userStatusEnumValue = pgEnum("status", ["active", "suspended"]);
export const officeEnum = pgEnum("office", ["SKY", "NTL"]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

const postStatus = pgEnum("status", postStatusValues);

/** Supabase Auth Schema */
const auth = pgSchema("auth");

export const SupabaseUser = auth.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/** ROLE TABLE  */
export const Role = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const CreateRoleSchemaInput = createInsertSchema(Role, {
  id: z.string().uuid().optional(),
  name: z.string().max(255),
  description: z.string().max(255),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export type RoleRecord = InferSelectModel<typeof Role>;

/** PERMISSION TABLE  */
export const Permission = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  module: text("module").notNull(),
  roleId: uuid("role_id").references(() => Role.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  action: text("action").notNull(),
  type: text("type").notNull(),
  allow: boolean("allow").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const CreatePermissionSchemaInput = createInsertSchema(Permission, {
  id: z.string().uuid().optional(),
  roleId: z.string().uuid(),
  action: z.string().max(255),
  module: z.string().max(255),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export type PermissionRecord = InferSelectModel<typeof Permission>;

/** USERS TABLE - KHÔNG dùng defaultRandom để khớp Supabase ID */
export const HRMUser = pgTable("users", (t) => ({
  id: uuid("id").primaryKey().notNull(),
  employeeCode: t.varchar("employee_code", { length: 255 }).notNull(),
  name: t.varchar("name", { length: 255 }).notNull(),
  firstName: t.varchar("firstName", { length: 255 }).notNull(),
  lastName: t.varchar("lastName", { length: 255 }).notNull(),
  email: t.varchar("email", { length: 255 }).notNull(),
  departmentId: uuid("department_id").references(() => Department.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  positionId: uuid("position_id").references(() => Position.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  roleId: uuid("role_id").references(() => Role.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  avatar: t.varchar("avatar_url", { length: 255 }),
  phone: t.varchar("phone", { length: 255 }).notNull(),
  status: userStatusEnumValue("status").notNull().default("active"),
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
    .references(() => HRMUser.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  month: varchar("month", { length: 10 }).notNull(),
  basicSalary: integer("basic_salary").notNull(),
  workingSalary: integer("working_salary").notNull(),
  bonus: integer("bonus").default(0),
  allowance: integer("allowance").default(0),
  otherIncome: integer("other_income").default(0),
  totalIncome: integer("total_income").notNull(),
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
  netIncome: integer("net_income").notNull(),
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

export type CreateSalarySlipInput = z.infer<typeof CreateSalarySlipSchema>;

/** ASSETS TABLE **/
export const Asset = pgTable("assets", (t) => ({
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: t.varchar("name", { length: 255 }).notNull(),
  type: t.varchar("type", { length: 255 }),
  assignedTo: uuid("assigned_to").references(() => HRMUser.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
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
export const Transaction = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  transactionType: varchar("transaction_type", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  transactionDate: timestamp("transaction_date", {
    withTimezone: true,
  }).defaultNow(),
  description: text("description"),
  status: varchar("status", { length: 255 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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
export const Workflow = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const CreateWorkflowSchema = createInsertSchema(Workflow).omit({
  id: true,
  createdAt: true,
});

/** WORKFLOW STEPS **/
export const WorkflowStep = pgTable("workflow_steps", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  workflowId: uuid("workflow_id")
    .references(() => Workflow.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  stepOrder: integer("step_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
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
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => Department.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: attendanceStatusEnum("status").notNull(),
  reason: text("reason").notNull(),
  approvalStatus: approvalStatusEnum("approval_status").default("pending"),
  approvedBy: uuid("approved_by").references(() => HRMUser.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const CreateLeaveRequestsSchema = createInsertSchema(LeaveRequests, {
  name: z.string().max(255),
  userId: z.string().uuid(),
  departmentId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(255),
  status: z.enum(attendanceStatusEnumValues),
  approvalStatus: z.enum(approvalStatusEnumValues),
  approvedBy: z.string().uuid(),
  approvedAt: z.string().datetime(),
}).omit({
  id: true,
  createdAt: true,
});

export const UpdateLeaveRequestsSchema = createInsertSchema(LeaveRequests, {
  id: z.string().uuid(),
  name: z.string().max(255),
  userId: z.string().uuid(),
  departmentId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(255),
  status: z.enum(attendanceStatusEnumValues),
  approvalStatus: z.enum(approvalStatusEnumValues),
  approvedBy: z.string().uuid(),
  approvedAt: z.string().datetime(),
}).omit({
  createdAt: true,
});
export type UpdateLeaveRequestsInput = z.infer<
  typeof UpdateLeaveRequestsSchema
>;
export type CreateLeaveRequestsInput = z.infer<
  typeof CreateLeaveRequestsSchema
>;
export type LeaveRequestsRecord = InferSelectModel<typeof LeaveRequests>;

/**  ATTENDANCES  */
export const Attendance = pgTable("attendances", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  status: attendanceStatusEnum("status").notNull(),
  isRemote: boolean("is_remote").default(false),
  remoteReason: text("remote_reason"),
  leaveRequestId: uuid("leave_request_id").references(() => LeaveRequests.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const CreateAttendanceSchema = createInsertSchema(Attendance, {
  userId: z.string().uuid(),
  date: z.string().datetime(),
  status: z.enum(["1", "P", "P1", "Pk", "L", "Nb", "W"]),
  isRemote: z.boolean().default(false),
  remoteReason: z.string().optional(),
  leaveRequestId: z.string().uuid().optional(),
}).omit({
  id: true,
});

export type CreateAttendanceInput = z.infer<typeof CreateAttendanceSchema>;
export type AttendanceRecord = InferSelectModel<typeof Attendance>;

/** DEPARTMENT TABLE  */
export const Department = pgTable("departments", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  office: officeEnum("office").default("NTL"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const CreateDepartmentSchemaInput = createInsertSchema(Department, {
  name: z.string().max(100),
  description: z.string().optional(),
  office: z.enum(["SKY", "NTL"]).default("NTL"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateDepartmentSchemaInput = createInsertSchema(Department, {
  id: z.string().uuid(),
  name: z.string().max(100),
  description: z.string().optional(),
  office: z.enum(["SKY", "NTL"]).default("NTL"),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchemaInput>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchemaInput>;

export type DepartmentRecord = InferSelectModel<typeof Department>;

export const Position = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  departmentId: uuid("department_id")
    .references(() => Department.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const CreatePositionSchemaInput = createInsertSchema(Position, {
  id: z.string().uuid().optional(),
  name: z.string().max(100),
  departmentId: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export type CreatePositionInput = z.infer<typeof CreatePositionSchemaInput>;
export type PositionRecord = InferSelectModel<typeof Position>;
export const UpdatePositionSchemaInput = createInsertSchema(Position, {
  id: z.string().uuid(),
  name: z.string().max(100),
  departmentId: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
});
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchemaInput>;

/** Audit Logs  */
export const AuditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  request: text("request").notNull(),
  response: text("response").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const CreateAuditLogSchema = createInsertSchema(AuditLogs, {
  userId: z.string().uuid(),
  action: z.string().max(255),
  entity: z.string().max(255),
  request: z.string().max(1000),
  response: z.string().max(1000),
  payload: z.object({}).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const UpdateAuditLogSchema = CreateAuditLogSchema.extend({
  id: z.number(),
});
export type CreateAuditLogInput = z.infer<typeof CreateAuditLogSchema>;
export type UpdateAuditLogInput = z.infer<typeof CreateAuditLogSchema> & {
  id: number;
};
export type AuditLogRecord = InferSelectModel<typeof AuditLogs>;

/** POST TABLE */
export const Posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id").references(() => HRMUser.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  status: postStatus("status").notNull(),
  attachments: json("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const CreatePostSchema = createInsertSchema(Posts, {
  title: z.string().max(255),
  content: z.string().max(1000),
  authorId: z.string().uuid(),
  status: z.enum(postStatusValues),
  attachments: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostiInput = z.infer<typeof CreatePostSchema> & {
  id: string;
};
export type PostRecord = InferSelectModel<typeof Posts>;

/** Notes TABLE */
export const Notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => Posts.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  userId: uuid("user_id").references(() => HRMUser.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const CreateNoteSchema = createInsertSchema(Notes, {
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().max(1000),
}).omit({
  id: true,
  createdAt: true,
});
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof CreateNoteSchema> & {
  id: string;
};
export type NoteRecord = InferSelectModel<typeof Notes>;

/** TAGs */
export const Tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const CreateTagSchema = createInsertSchema(Tags, {
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
}).omit({
  id: true,
  createdAt: true,
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type TagRecord = InferSelectModel<typeof Tags>;
export type UpdateTagInput = z.infer<typeof CreateTagSchema> & {
  id: string;
};

export const PostTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => Posts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => Tags.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniquePostTag: unique("unique_post_tag").on(t.postId, t.tagId),
  }),
);

export const CreatePostTagSchema = createInsertSchema(PostTags, {
  postId: z.string().uuid(),
  tagId: z.string().uuid(),
}).omit({
  id: true,
  createdAt: true,
});
export type CreatePostTagInput = z.infer<typeof CreatePostTagSchema>;
export type PostTagRecord = InferSelectModel<typeof PostTags>;
export type UpdatePostTagInput = z.infer<typeof CreateTagSchema> & {
  id: string;
};
/** LEAVE BALANCES */
export const LeaveBalances = pgTable("leave_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => HRMUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull().default(12),
  usedDays: integer("used_days").notNull().default(0),
  remainingDays: integer("remaining_days").notNull().default(12),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const CreateLeaveBalanceSchema = createInsertSchema(LeaveBalances, {
  userId: z.string().uuid(),
  year: z.number().int(),
  totalDays: z.number().int().default(12),
  usedDays: z.number().int().default(0),
  remainingDays: z.number().int().default(12),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateLeaveBalanceInput = z.infer<typeof CreateLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<
  typeof CreateLeaveBalanceSchema
> & {
  id: string;
};
export type LeaveBalanceRecord = InferSelectModel<typeof LeaveBalances>;

/** RELATIONS **/

export const leaveBalanceRelations = relations(LeaveBalances, ({ one }) => ({
  user: one(HRMUser, {
    fields: [LeaveBalances.userId],
    references: [HRMUser.id],
  }),
}));

export const PostsRelations = relations(Posts, ({ one, many }) => ({
  author: one(HRMUser, {
    fields: [Posts.authorId],
    references: [HRMUser.id],
  }),
  postTags: many(PostTags),
  notes: many(Notes),
}));

export const PostTagsRelations = relations(PostTags, ({ one }) => ({
  post: one(Posts, {
    fields: [PostTags.postId],
    references: [Posts.id],
  }),
  tag: one(Tags, {
    fields: [PostTags.tagId],
    references: [Tags.id],
  }),
}));

export const TagsRelations = relations(Tags, ({ many }) => ({
  postTags: many(PostTags),
}));

export const NotesRelations = relations(Notes, ({ one }) => ({
  post: one(Posts, {
    fields: [Notes.postId],
    references: [Posts.id],
  }),
  user: one(HRMUser, {
    fields: [Notes.userId],
    references: [HRMUser.id],
  }),
}));

export const LeaveRequestsRelations = relations(LeaveRequests, ({ one }) => ({
  user: one(HRMUser, {
    fields: [LeaveRequests.userId],
    references: [HRMUser.id],
  }),
}));

export const HRMUserRelations = relations(HRMUser, ({ one, many }) => ({
  salarySlips: many(SalarySlip),
  assets: many(Asset),
  transactions: many(Transaction),
  leaveRequests: many(LeaveRequests),
  attendances: many(Attendance),
  department: one(Department, {
    fields: [HRMUser.departmentId],
    references: [Department.id],
  }),
  position: one(Role, {
    fields: [HRMUser.positionId],
    references: [Role.id],
  }),
  role: one(Role, {
    fields: [HRMUser.roleId],
    references: [Role.id],
  }),
  leaveBalances: many(LeaveBalances),
}));
export const DepartmentRelations = relations(Department, ({ many }) => ({
  users: many(HRMUser),
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

export const RoleRelations = relations(Role, ({ many }) => ({
  permissions: many(Permission),
  users: many(HRMUser),
}));

export const PermissionRelations = relations(Permission, ({ one }) => ({
  role: one(Role, {
    fields: [Permission.roleId],
    references: [Role.id],
  }),
}));

export const schema = {
  Tags,
  PostTags,
  HRMUser,
  SalarySlip,
  Asset,
  Transaction,
  Workflow,
  WorkflowStep,
  Attendance,
  Notifications,
  LeaveRequests,
  Department,
  Permission,
  Role,
  Position,
  AuditLogs,
  LeaveBalances,
  Posts,
  Notes,
};

export default {
  HRMUserRelations,
  SalarySlipRelations,
  AssetRelations,
  TransactionRelations,
  WorkflowRelations,
  WorkflowStepRelations,
  AttendanceRelations,
  DepartmentRelations,
  PostsRelations,
  TagsRelations,
  PostTagsRelations,
  LeaveRequestsRelations,
  NotesRelations,
  RoleRelations,
  PermissionRelations,
  leaveBalanceRelations,
};
