"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStepRelations = exports.WorkflowRelations = exports.TransactionRelations = exports.AssetRelations = exports.SalarySlipRelations = exports.HRMUserRelations = exports.CreateWorkflowStepSchema = exports.WorkflowStep = exports.CreateWorkflowSchema = exports.Workflow = exports.CreateTransactionSchema = exports.Transaction = exports.CreateAssetSchema = exports.Asset = exports.CreateSalarySlipSchema = exports.SalarySlip = exports.HRMUser = exports.SupabaseUser = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
/** Supabase Auth Schema **/
var auth = (0, pg_core_1.pgSchema)("auth");
exports.SupabaseUser = auth.table("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    role: (0, pg_core_1.text)("role"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow(),
});
/** USERS TABLE **/
exports.HRMUser = (0, pg_core_1.pgTable)("users", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    firstName: t.varchar("firstName", { length: 255 }).notNull(),
    lastName: t.varchar("lastName", { length: 255 }).notNull(),
    email: t.varchar("email", { length: 255 }).notNull(),
    role: t.varchar("role", { length: 255 }).notNull(),
    phone: t.varchar("phone", { length: 255 }).notNull(),
    status: t.varchar("status", { length: 255 }).default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}); });
/** SALARY SLIP TABLE **/
exports.SalarySlip = (0, pg_core_1.pgTable)("salary_slips", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(function () { return exports.HRMUser.id; })
        .notNull(),
    month: (0, pg_core_1.varchar)("month", { length: 10 }).notNull(),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 255 }).default("pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}); });
exports.CreateSalarySlipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.SalarySlip, {
    userId: zod_1.z.string(),
    month: zod_1.z.string().max(10),
    totalAmount: zod_1.z.number().int(),
    status: zod_1.z.string().max(255),
}).omit({
    id: true,
    createdAt: true,
});
/** ASSETS TABLE **/
exports.Asset = (0, pg_core_1.pgTable)("assets", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    name: t.varchar("name", { length: 255 }).notNull(),
    type: t.varchar("type", { length: 255 }),
    assignedTo: (0, pg_core_1.uuid)("assigned_to").references(function () { return exports.HRMUser.id; }),
    status: t.varchar("status", { length: 255 }).default("in-use"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}); });
exports.CreateAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.Asset, {
    name: zod_1.z.string().max(255),
    type: zod_1.z.string().max(255),
    assignedTo: zod_1.z.string(),
    status: zod_1.z.string().max(255),
}).omit({
    id: true,
    createdAt: true,
});
/** TRANSACTIONS TABLE **/
exports.Transaction = (0, pg_core_1.pgTable)("transactions", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    transactionType: (0, pg_core_1.varchar)("transaction_type", { length: 255 }).notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date", {
        withTimezone: true,
    }).defaultNow(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status", { length: 255 }).default("pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}); });
exports.CreateTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.Transaction, {
    transactionType: zod_1.z.string().max(255),
    amount: zod_1.z.number().int(),
    transactionDate: zod_1.z.string(),
    description: zod_1.z.string().max(255),
    status: zod_1.z.string().max(255),
}).omit({
    id: true,
    createdAt: true,
    transactionDate: true,
});
/** WORKFLOW TABLE **/
exports.Workflow = (0, pg_core_1.pgTable)("workflows", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}); });
exports.CreateWorkflowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.Workflow).omit({
    id: true,
    createdAt: true,
});
/** WORKFLOW STEPS **/
exports.WorkflowStep = (0, pg_core_1.pgTable)("workflow_steps", function (t) { return ({
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom().notNull(),
    workflowId: (0, pg_core_1.uuid)("workflow_id")
        .references(function () { return exports.Workflow.id; })
        .notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    stepOrder: (0, pg_core_1.integer)("step_order").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}); });
exports.CreateWorkflowStepSchema = (0, drizzle_zod_1.createInsertSchema)(exports.WorkflowStep, {
    workflowId: zod_1.z.string(),
    name: zod_1.z.string().max(255),
    description: zod_1.z.string().max(255),
    stepOrder: zod_1.z.number().int(),
}).omit({
    id: true,
    createdAt: true,
});
/** RELATIONS **/
exports.HRMUserRelations = (0, drizzle_orm_1.relations)(exports.HRMUser, function (_a) {
    var many = _a.many;
    return ({
        salarySlips: many(exports.SalarySlip),
        assets: many(exports.Asset),
        transactions: many(exports.Transaction),
    });
});
exports.SalarySlipRelations = (0, drizzle_orm_1.relations)(exports.SalarySlip, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.HRMUser, { fields: [exports.SalarySlip.userId], references: [exports.HRMUser.id] }),
    });
});
exports.AssetRelations = (0, drizzle_orm_1.relations)(exports.Asset, function (_a) {
    var one = _a.one;
    return ({
        assignedUser: one(exports.HRMUser, {
            fields: [exports.Asset.assignedTo],
            references: [exports.HRMUser.id],
        }),
    });
});
exports.TransactionRelations = (0, drizzle_orm_1.relations)(exports.Transaction, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.HRMUser, {
            fields: [exports.Transaction.id],
            references: [exports.HRMUser.id],
        }),
    });
});
exports.WorkflowRelations = (0, drizzle_orm_1.relations)(exports.Workflow, function (_a) {
    var many = _a.many;
    return ({
        steps: many(exports.WorkflowStep),
    });
});
exports.WorkflowStepRelations = (0, drizzle_orm_1.relations)(exports.WorkflowStep, function (_a) {
    var one = _a.one;
    return ({
        workflow: one(exports.Workflow, {
            fields: [exports.WorkflowStep.workflowId],
            references: [exports.Workflow.id],
        }),
    });
});
exports.default = {
    HRMUserRelations: exports.HRMUserRelations,
    SalarySlipRelations: exports.SalarySlipRelations,
    AssetRelations: exports.AssetRelations,
    TransactionRelations: exports.TransactionRelations,
    WorkflowRelations: exports.WorkflowRelations,
    WorkflowStepRelations: exports.WorkflowStepRelations,
};
